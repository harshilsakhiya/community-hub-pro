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

    // Find pending bills past due date
    const { data: pendingBills, error: fetchError } = await supabase
      .from("maintenance_bills")
      .select("id, due_date, amount")
      .eq("status", "pending")
      .lt("due_date", today);

    if (fetchError) throw fetchError;

    if (!pendingBills || pendingBills.length === 0) {
      console.log("No pending bills to mark as overdue");
      return new Response(JSON.stringify({
        success: true,
        message: "No pending bills to mark as overdue",
        updatedCount: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update bills to overdue and apply late fee
    let updatedCount = 0;
    for (const bill of pendingBills) {
      const lateFee = Math.round(Number(bill.amount) * 0.1);
      const { error: updateError } = await supabase
        .from("maintenance_bills")
        .update({ status: "overdue" as const, late_fee: lateFee })
        .eq("id", bill.id);

      if (updateError) {
        console.error(`Error updating bill ${bill.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }

    console.log(`Marked ${updatedCount} bills as overdue`);

    return new Response(JSON.stringify({
      success: true,
      message: `Marked ${updatedCount} bills as overdue`,
      updatedCount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error marking overdue bills:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
