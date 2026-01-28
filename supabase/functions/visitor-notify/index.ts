import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VisitorNotifyRequest {
  visitorId: string;
  action: "arrival" | "checkout";
}

interface VisitorData {
  id: string;
  name: string;
  phone: string | null;
  purpose: string;
  vehicle_number: string | null;
  unit_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { visitorId, action }: VisitorNotifyRequest = await req.json();

    if (!visitorId || !action) {
      return new Response(JSON.stringify({ error: "Missing visitorId or action" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get visitor details
    const { data: visitor, error: visitorError } = await supabase
      .from("visitors")
      .select("id, name, phone, purpose, vehicle_number, unit_id")
      .eq("id", visitorId)
      .single();

    if (visitorError || !visitor) {
      return new Response(JSON.stringify({ error: "Visitor not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const typedVisitor = visitor as VisitorData;

    // Get unit details
    const { data: unit, error: unitError } = await supabase
      .from("units")
      .select("id, unit_number, block, owner_id")
      .eq("id", typedVisitor.unit_id)
      .single();

    let unitDisplay = "Unknown";
    if (unit) {
      unitDisplay = `${unit.block}-${unit.unit_number}`;

      // Get owner for notification
      if (unit.owner_id) {
        const { data: owner } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .eq("id", unit.owner_id)
          .single();

        if (owner) {
          console.log(`Notification for ${action}:`, {
            owner: owner.full_name,
            ownerPhone: owner.phone,
            ownerEmail: owner.email,
            visitor: typedVisitor.name,
            visitorPhone: typedVisitor.phone,
            unit: unitDisplay,
            purpose: typedVisitor.purpose,
            vehicle: typedVisitor.vehicle_number,
          });
        }
      }
    }

    const message = action === "arrival" 
      ? `Visitor ${typedVisitor.name} has arrived at the gate`
      : `Visitor ${typedVisitor.name} has checked out`;

    return new Response(JSON.stringify({
      success: true,
      message,
      visitor: {
        name: typedVisitor.name,
        purpose: typedVisitor.purpose,
        unit: unitDisplay,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error in visitor notification:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
