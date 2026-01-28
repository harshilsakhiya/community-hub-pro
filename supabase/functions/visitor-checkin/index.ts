import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VisitorRequest {
  action: "checkin" | "checkout" | "register";
  visitor_id?: string;
  name?: string;
  phone?: string;
  purpose?: string;
  unit_id?: string;
  vehicle_number?: string;
  notes?: string;
}

serve(async (req: Request) => {
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

    // Check if user is gatekeeper or admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["gatekeeper", "admin"]);

    const isGatekeeperOrAdmin = roleData && roleData.length > 0;

    const body: VisitorRequest = await req.json();
    const { action } = body;

    switch (action) {
      case "register": {
        if (!body.name || !body.purpose || !body.unit_id) {
          return new Response(
            JSON.stringify({ error: "Name, purpose, and unit_id are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify unit exists
        const { data: unit, error: unitError } = await supabase
          .from("units")
          .select("id, unit_number, block")
          .eq("id", body.unit_id)
          .maybeSingle();

        if (unitError || !unit) {
          return new Response(
            JSON.stringify({ error: "Invalid unit" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const visitorData: Record<string, unknown> = {
          name: body.name,
          phone: body.phone || null,
          purpose: body.purpose,
          unit_id: body.unit_id,
          vehicle_number: body.vehicle_number || null,
          notes: body.notes || null,
          check_in_time: new Date().toISOString(),
        };

        // If gatekeeper is logging, add logged_by
        if (isGatekeeperOrAdmin) {
          visitorData.logged_by = userId;
        } else {
          // Resident pre-approving visitor
          visitorData.pre_approved = true;
          visitorData.pre_approved_by = userId;
          visitorData.check_in_time = null; // Will be set on actual check-in
        }

        const { data: visitor, error: insertError } = await supabase
          .from("visitors")
          .insert(visitorData)
          .select()
          .single();

        if (insertError) {
          console.error("Error registering visitor:", insertError);
          throw new Error("Failed to register visitor");
        }

        // Generate a simple OTP code for verification
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        console.log(`Visitor registered: ${visitor.id}, OTP: ${otpCode}`);

        return new Response(
          JSON.stringify({
            message: isGatekeeperOrAdmin ? "Visitor checked in" : "Visitor pre-approved",
            visitor,
            otp_code: otpCode,
            unit: `${unit.block}-${unit.unit_number}`,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "checkin": {
        if (!isGatekeeperOrAdmin) {
          return new Response(
            JSON.stringify({ error: "Only gatekeepers can check in visitors" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!body.visitor_id) {
          return new Response(
            JSON.stringify({ error: "visitor_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: visitor, error: updateError } = await supabase
          .from("visitors")
          .update({
            check_in_time: new Date().toISOString(),
            logged_by: userId,
          })
          .eq("id", body.visitor_id)
          .select(`
            *,
            units:unit_id (unit_number, block)
          `)
          .single();

        if (updateError) {
          console.error("Error checking in visitor:", updateError);
          throw new Error("Failed to check in visitor");
        }

        console.log(`Visitor checked in: ${visitor.id}`);

        return new Response(
          JSON.stringify({ message: "Visitor checked in", visitor }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "checkout": {
        if (!isGatekeeperOrAdmin) {
          return new Response(
            JSON.stringify({ error: "Only gatekeepers can check out visitors" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!body.visitor_id) {
          return new Response(
            JSON.stringify({ error: "visitor_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: visitor, error: updateError } = await supabase
          .from("visitors")
          .update({ check_out_time: new Date().toISOString() })
          .eq("id", body.visitor_id)
          .select()
          .single();

        if (updateError) {
          console.error("Error checking out visitor:", updateError);
          throw new Error("Failed to check out visitor");
        }

        console.log(`Visitor checked out: ${visitor.id}`);

        return new Response(
          JSON.stringify({ message: "Visitor checked out", visitor }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use: register, checkin, or checkout" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error in visitor-checkin:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
