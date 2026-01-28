import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReportRequest {
  type: "collection" | "complaints" | "visitors" | "occupancy";
  startDate?: string;
  endDate?: string;
  months?: number;
}

interface ComplaintData {
  category: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, months = 6 }: ReportRequest = await req.json();

    if (!type) {
      return new Response(JSON.stringify({ error: "Report type required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    let reportData: unknown;

    switch (type) {
      case "collection": {
        const { data: bills, error } = await supabase
          .from("maintenance_bills")
          .select("billing_month, amount, late_fee, status, paid_date")
          .order("billing_month", { ascending: false });

        if (error) throw error;

        const monthlyData: Record<string, { billed: number; collected: number; pending: number; overdue: number }> = {};
        
        bills?.forEach(bill => {
          const month = String(bill.billing_month).slice(0, 7);
          if (!monthlyData[month]) {
            monthlyData[month] = { billed: 0, collected: 0, pending: 0, overdue: 0 };
          }
          const amount = Number(bill.amount) + Number(bill.late_fee || 0);
          monthlyData[month].billed += amount;
          if (bill.status === "paid") {
            monthlyData[month].collected += amount;
          } else if (bill.status === "overdue") {
            monthlyData[month].overdue += amount;
          } else {
            monthlyData[month].pending += amount;
          }
        });

        reportData = Object.entries(monthlyData)
          .map(([month, data]) => ({ month, ...data }))
          .slice(0, months);
        break;
      }

      case "complaints": {
        const { data: complaints, error } = await supabase
          .from("complaints")
          .select("category, status, priority, created_at, resolved_at");

        if (error) throw error;

        const categoryStats: Record<string, { total: number; open: number; resolved: number }> = {};
        const priorityStats: Record<string, number> = {};

        (complaints as ComplaintData[] | null)?.forEach(c => {
          if (!categoryStats[c.category]) {
            categoryStats[c.category] = { total: 0, open: 0, resolved: 0 };
          }
          categoryStats[c.category].total++;
          if (c.status === "open" || c.status === "in_progress") {
            categoryStats[c.category].open++;
          } else {
            categoryStats[c.category].resolved++;
          }

          if (!priorityStats[c.priority]) priorityStats[c.priority] = 0;
          priorityStats[c.priority]++;
        });

        reportData = {
          byCategory: categoryStats,
          byPriority: priorityStats,
          total: complaints?.length || 0,
          avgResolutionDays: calculateAvgResolution(complaints as ComplaintData[] | null),
        };
        break;
      }

      case "visitors": {
        const dateLimit = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: visitors, error } = await supabase
          .from("visitors")
          .select("purpose, check_in_time, check_out_time, created_at")
          .gte("created_at", dateLimit);

        if (error) throw error;

        const purposeStats: Record<string, number> = {};
        const dailyCounts: Record<string, number> = {};

        visitors?.forEach(v => {
          if (!purposeStats[v.purpose]) purposeStats[v.purpose] = 0;
          purposeStats[v.purpose]++;

          const day = String(v.created_at).slice(0, 10);
          if (!dailyCounts[day]) dailyCounts[day] = 0;
          dailyCounts[day]++;
        });

        const days = Object.keys(dailyCounts).length || 1;
        const totalVisitors = visitors?.length || 0;

        reportData = {
          byPurpose: purposeStats,
          total: totalVisitors,
          dailyAverage: Math.round(totalVisitors / days),
        };
        break;
      }

      case "occupancy": {
        const { data: units, error } = await supabase
          .from("units")
          .select("block, is_occupied, area_sqft");

        if (error) throw error;

        const blockStats: Record<string, { total: number; occupied: number; vacant: number; totalArea: number }> = {};

        units?.forEach(u => {
          if (!blockStats[u.block]) {
            blockStats[u.block] = { total: 0, occupied: 0, vacant: 0, totalArea: 0 };
          }
          blockStats[u.block].total++;
          blockStats[u.block].totalArea += Number(u.area_sqft || 0);
          if (u.is_occupied) {
            blockStats[u.block].occupied++;
          } else {
            blockStats[u.block].vacant++;
          }
        });

        const totalUnits = units?.length || 0;
        const occupiedUnits = units?.filter(u => u.is_occupied)?.length || 0;

        reportData = {
          byBlock: blockStats,
          overall: {
            total: totalUnits,
            occupied: occupiedUnits,
            vacant: totalUnits - occupiedUnits,
            occupancyRate: totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
          },
        };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid report type" }), {
          status: 400,
          headers: corsHeaders,
        });
    }

    console.log(`Generated ${type} report`);

    return new Response(JSON.stringify({
      success: true,
      type,
      data: reportData,
      generatedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error generating report:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function calculateAvgResolution(complaints: ComplaintData[] | null): number {
  if (!complaints) return 0;
  
  const resolved = complaints.filter(c => c.resolved_at && c.created_at);
  if (resolved.length === 0) return 0;

  const totalDays = resolved.reduce((sum, c) => {
    const created = new Date(c.created_at);
    const resolvedAt = new Date(c.resolved_at!);
    const days = (resolvedAt.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);

  return Math.round(totalDays / resolved.length);
}
