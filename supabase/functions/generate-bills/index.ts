import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateBillsRequest {
  billingMonth: string;
  dueDate: string;
  baseAmount: number;
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from token
    const { data: userData, error: userError } = await userClient.auth.getUser();
    
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = userData.user.id;
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if user is admin
    const { data: roleData, error: roleError } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleError || roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Only admins can generate bills" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    const { billingMonth, dueDate, baseAmount }: GenerateBillsRequest = await req.json();

    if (!billingMonth || !dueDate || !baseAmount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get all occupied units
    const { data: units, error: unitsError } = await serviceClient
      .from("units")
      .select("id, unit_number, block, area_sqft")
      .eq("is_occupied", true);

    if (unitsError) throw unitsError;

    if (!units || units.length === 0) {
      return new Response(JSON.stringify({ error: "No occupied units found" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Check for existing bills for this month
    const { data: existingBills, error: existingError } = await serviceClient
      .from("maintenance_bills")
      .select("unit_id")
      .eq("billing_month", billingMonth);

    if (existingError) throw existingError;

    const existingUnitIds = new Set(existingBills?.map(b => b.unit_id) || []);
    const unitsToGenerate = units.filter(u => !existingUnitIds.has(u.id));

    if (unitsToGenerate.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Bills already generated for all units this month",
        generatedCount: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate bills
    const bills = unitsToGenerate.map((unit, index) => {
      const timestamp = Date.now().toString().slice(-6);
      const invoiceNumber = `INV-${billingMonth.slice(0, 7).replace("-", "")}-${timestamp}${index.toString().padStart(3, "0")}`;
      const calculatedAmount = unit.area_sqft ? baseAmount + (Number(unit.area_sqft) * 0.5) : baseAmount;

      return {
        unit_id: unit.id,
        invoice_number: invoiceNumber,
        billing_month: billingMonth,
        due_date: dueDate,
        amount: Math.round(calculatedAmount),
        late_fee: 0,
        status: "pending" as const,
      };
    });

    const { data: insertedBills, error: insertError } = await serviceClient
      .from("maintenance_bills")
      .insert(bills)
      .select();

    if (insertError) throw insertError;

    console.log(`Generated ${insertedBills?.length} bills for ${billingMonth}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Generated ${insertedBills?.length} bills`,
      generatedCount: insertedBills?.length,
      data: insertedBills,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error generating bills:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
