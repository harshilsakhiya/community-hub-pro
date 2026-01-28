import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BillGenerationRequest {
  billing_month?: string; // Format: YYYY-MM-DD (first day of month)
  amount?: number;
  due_days?: number; // Days from now for due date
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token for auth check
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Use service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Only admins can generate bills" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: BillGenerationRequest = await req.json().catch(() => ({}));
    
    const now = new Date();
    const billingMonth = body.billing_month || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const defaultAmount = body.amount || 5000;
    const dueDays = body.due_days || 15;
    const dueDate = new Date(now.getTime() + dueDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Get all occupied units
    const { data: units, error: unitsError } = await supabase
      .from("units")
      .select("id, unit_number, block, area_sqft")
      .eq("is_occupied", true);

    if (unitsError) {
      console.error("Error fetching units:", unitsError);
      throw new Error("Failed to fetch units");
    }

    if (!units || units.length === 0) {
      return new Response(
        JSON.stringify({ message: "No occupied units found", bills_created: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing bills for this month
    const { data: existingBills } = await supabase
      .from("maintenance_bills")
      .select("unit_id")
      .eq("billing_month", billingMonth);

    const existingUnitIds = new Set(existingBills?.map((b) => b.unit_id) || []);

    // Generate bills for units without existing bills
    const billsToCreate = units
      .filter((unit) => !existingUnitIds.has(unit.id))
      .map((unit) => {
        // Calculate amount based on area (optional)
        const calculatedAmount = unit.area_sqft 
          ? Math.round((unit.area_sqft / 1000) * defaultAmount)
          : defaultAmount;

        return {
          unit_id: unit.id,
          billing_month: billingMonth,
          amount: calculatedAmount,
          due_date: dueDate,
          invoice_number: `INV-${billingMonth.replace(/-/g, "")}-${unit.block}-${unit.unit_number}`,
          status: "pending" as const,
        };
      });

    if (billsToCreate.length === 0) {
      return new Response(
        JSON.stringify({ message: "Bills already exist for all units this month", bills_created: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert bills
    const { data: createdBills, error: insertError } = await supabase
      .from("maintenance_bills")
      .insert(billsToCreate)
      .select();

    if (insertError) {
      console.error("Error creating bills:", insertError);
      throw new Error("Failed to create bills");
    }

    console.log(`Generated ${createdBills?.length || 0} bills for ${billingMonth}`);

    return new Response(
      JSON.stringify({
        message: "Bills generated successfully",
        bills_created: createdBills?.length || 0,
        billing_month: billingMonth,
        due_date: dueDate,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-bills:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
