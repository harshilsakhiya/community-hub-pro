import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user roles
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const roles = userRoles?.map((r) => r.role) || [];
    const isAdmin = roles.includes("admin");
    const isCommitteeMember = roles.includes("committee_member");
    const isGatekeeper = roles.includes("gatekeeper");

    // Get user's unit if resident
    const { data: userUnit } = await supabase
      .from("units")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();

    const stats: Record<string, unknown> = {
      user_roles: roles,
    };

    // Admin/Committee: Full stats
    if (isAdmin || isCommitteeMember) {
      // Total units
      const { count: totalUnits } = await supabase
        .from("units")
        .select("*", { count: "exact", head: true });

      // Occupied units
      const { count: occupiedUnits } = await supabase
        .from("units")
        .select("*", { count: "exact", head: true })
        .eq("is_occupied", true);

      // Total residents
      const { count: totalResidents } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "resident");

      // Pending bills
      const { count: pendingBills } = await supabase
        .from("maintenance_bills")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Overdue bills
      const { count: overdueBills } = await supabase
        .from("maintenance_bills")
        .select("*", { count: "exact", head: true })
        .eq("status", "overdue");

      // Total revenue this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: paidBills } = await supabase
        .from("maintenance_bills")
        .select("amount")
        .eq("status", "paid")
        .gte("paid_date", startOfMonth.toISOString().split("T")[0]);

      const monthlyRevenue = paidBills?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0;

      // Open complaints
      const { count: openComplaints } = await supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "in_progress"]);

      // Today's visitors
      const today = new Date().toISOString().split("T")[0];
      const { count: todayVisitors } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today);

      stats.admin_stats = {
        total_units: totalUnits || 0,
        occupied_units: occupiedUnits || 0,
        vacant_units: (totalUnits || 0) - (occupiedUnits || 0),
        total_residents: totalResidents || 0,
        pending_bills: pendingBills || 0,
        overdue_bills: overdueBills || 0,
        monthly_revenue: monthlyRevenue,
        open_complaints: openComplaints || 0,
        today_visitors: todayVisitors || 0,
      };
    }

    // Gatekeeper: Visitor stats
    if (isGatekeeper || isAdmin) {
      const today = new Date().toISOString().split("T")[0];

      // Today's check-ins
      const { count: todayCheckins } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true })
        .gte("check_in_time", today)
        .not("check_in_time", "is", null);

      // Currently inside (checked in but not out)
      const { count: currentlyInside } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true })
        .not("check_in_time", "is", null)
        .is("check_out_time", null);

      // Pre-approved waiting
      const { count: preApproved } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true })
        .eq("pre_approved", true)
        .is("check_in_time", null);

      stats.gatekeeper_stats = {
        today_checkins: todayCheckins || 0,
        currently_inside: currentlyInside || 0,
        pre_approved_waiting: preApproved || 0,
      };
    }

    // Resident: Personal stats
    if (userUnit) {
      // My pending bills
      const { data: myBills } = await supabase
        .from("maintenance_bills")
        .select("id, amount, status, due_date")
        .eq("unit_id", userUnit.id)
        .in("status", ["pending", "overdue"])
        .order("due_date", { ascending: true })
        .limit(5);

      // My open complaints
      const { count: myOpenComplaints } = await supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("unit_id", userUnit.id)
        .in("status", ["open", "in_progress"]);

      // My recent visitors
      const { data: myVisitors } = await supabase
        .from("visitors")
        .select("id, name, purpose, check_in_time, check_out_time")
        .eq("unit_id", userUnit.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const totalPending = myBills?.reduce((sum, bill) => 
        bill.status === "pending" || bill.status === "overdue" ? sum + Number(bill.amount) : sum, 0) || 0;

      stats.resident_stats = {
        pending_bills: myBills || [],
        total_pending_amount: totalPending,
        open_complaints: myOpenComplaints || 0,
        recent_visitors: myVisitors || [],
        unit_id: userUnit.id,
      };
    }

    console.log(`Dashboard stats fetched for user ${userId}`);

    return new Response(
      JSON.stringify(stats),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in dashboard-stats:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
