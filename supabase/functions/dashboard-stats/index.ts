import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const today = new Date().toISOString().split('T')[0];

    // Fetch units stats
    const { data: units, error: unitsError } = await supabase
      .from("units")
      .select("id, is_occupied");
    
    if (unitsError) throw unitsError;
    
    const totalUnits = units?.length || 0;
    const occupiedUnits = units?.filter(u => u.is_occupied)?.length || 0;
    const vacantUnits = totalUnits - occupiedUnits;

    // Fetch bills stats
    const { data: bills, error: billsError } = await supabase
      .from("maintenance_bills")
      .select("status, amount, late_fee");
    
    if (billsError) throw billsError;

    const pendingBills = bills?.filter(b => b.status === "pending")?.length || 0;
    const overdueBills = bills?.filter(b => b.status === "overdue")?.length || 0;
    const totalCollection = bills?.filter(b => b.status === "paid")
      ?.reduce((sum, b) => sum + Number(b.amount) + Number(b.late_fee || 0), 0) || 0;
    const pendingAmount = bills?.filter(b => b.status !== "paid")
      ?.reduce((sum, b) => sum + Number(b.amount) + Number(b.late_fee || 0), 0) || 0;

    // Fetch complaints stats
    const { data: complaints, error: complaintsError } = await supabase
      .from("complaints")
      .select("status");
    
    if (complaintsError) throw complaintsError;
    
    const openComplaints = complaints?.filter(c => c.status === "open")?.length || 0;
    const inProgressComplaints = complaints?.filter(c => c.status === "in_progress")?.length || 0;
    const resolvedComplaints = complaints?.filter(c => c.status === "resolved" || c.status === "closed")?.length || 0;

    // Fetch today's visitors
    const { data: visitors, error: visitorsError } = await supabase
      .from("visitors")
      .select("id, check_in_time, check_out_time")
      .gte("created_at", today);
    
    if (visitorsError) throw visitorsError;
    
    const todayVisitors = visitors?.length || 0;
    const currentlyInside = visitors?.filter(v => v.check_in_time && !v.check_out_time)?.length || 0;

    // Fetch vehicles count
    const { count: vehiclesCount, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("id", { count: "exact" });
    
    if (vehiclesError) throw vehiclesError;

    const stats = {
      units: {
        total: totalUnits,
        occupied: occupiedUnits,
        vacant: vacantUnits,
      },
      bills: {
        pending: pendingBills,
        overdue: overdueBills,
        totalCollection,
        pendingAmount,
      },
      complaints: {
        open: openComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
      },
      visitors: {
        today: todayVisitors,
        currentlyInside,
      },
      vehicles: vehiclesCount || 0,
    };

    console.log("Dashboard stats fetched successfully:", stats);

    return new Response(JSON.stringify({ success: true, data: stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error fetching dashboard stats:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
