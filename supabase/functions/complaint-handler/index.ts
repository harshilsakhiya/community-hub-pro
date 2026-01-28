import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ComplaintCategory = "plumbing" | "electrical" | "noise" | "maintenance" | "security" | "parking" | "other";
type ComplaintPriority = "low" | "medium" | "high" | "urgent";
type ComplaintStatus = "open" | "in_progress" | "resolved" | "closed";

interface ComplaintRequest {
  action: "create" | "update_status" | "assign" | "resolve";
  complaint_id?: string;
  title?: string;
  description?: string;
  category?: ComplaintCategory;
  priority?: ComplaintPriority;
  unit_id?: string;
  status?: ComplaintStatus;
  assigned_to?: string;
  resolution_notes?: string;
}

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
    const canManageComplaints = isAdmin || isCommitteeMember;

    const body: ComplaintRequest = await req.json();
    const { action } = body;

    switch (action) {
      case "create": {
        if (!body.title || !body.description || !body.unit_id) {
          return new Response(
            JSON.stringify({ error: "Title, description, and unit_id are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify user owns or is associated with the unit
        const { data: unit } = await supabase
          .from("units")
          .select("id, owner_id")
          .eq("id", body.unit_id)
          .maybeSingle();

        if (!unit) {
          return new Response(
            JSON.stringify({ error: "Invalid unit" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!isAdmin && unit.owner_id !== userId) {
          return new Response(
            JSON.stringify({ error: "You can only create complaints for your own unit" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate ticket number
        const ticketNumber = `CMP-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;

        const { data: complaint, error: insertError } = await supabase
          .from("complaints")
          .insert({
            title: body.title,
            description: body.description,
            category: body.category || "other",
            priority: body.priority || "medium",
            unit_id: body.unit_id,
            submitted_by: userId,
            ticket_number: ticketNumber,
            status: "open",
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating complaint:", insertError);
          throw new Error("Failed to create complaint");
        }

        console.log(`Complaint created: ${complaint.ticket_number}`);

        return new Response(
          JSON.stringify({ message: "Complaint submitted", complaint }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_status": {
        if (!canManageComplaints) {
          return new Response(
            JSON.stringify({ error: "Only admin or committee members can update status" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!body.complaint_id || !body.status) {
          return new Response(
            JSON.stringify({ error: "complaint_id and status are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: Record<string, unknown> = { status: body.status };
        
        if (body.status === "resolved" || body.status === "closed") {
          updateData.resolved_at = new Date().toISOString();
        }

        const { data: complaint, error: updateError } = await supabase
          .from("complaints")
          .update(updateData)
          .eq("id", body.complaint_id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating complaint:", updateError);
          throw new Error("Failed to update complaint");
        }

        console.log(`Complaint ${complaint.ticket_number} status updated to ${body.status}`);

        return new Response(
          JSON.stringify({ message: "Status updated", complaint }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "assign": {
        if (!canManageComplaints) {
          return new Response(
            JSON.stringify({ error: "Only admin or committee members can assign complaints" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!body.complaint_id || !body.assigned_to) {
          return new Response(
            JSON.stringify({ error: "complaint_id and assigned_to are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: complaint, error: updateError } = await supabase
          .from("complaints")
          .update({
            assigned_to: body.assigned_to,
            status: "in_progress",
          })
          .eq("id", body.complaint_id)
          .select()
          .single();

        if (updateError) {
          console.error("Error assigning complaint:", updateError);
          throw new Error("Failed to assign complaint");
        }

        console.log(`Complaint ${complaint.ticket_number} assigned to ${body.assigned_to}`);

        return new Response(
          JSON.stringify({ message: "Complaint assigned", complaint }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resolve": {
        if (!canManageComplaints) {
          return new Response(
            JSON.stringify({ error: "Only admin or committee members can resolve complaints" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!body.complaint_id) {
          return new Response(
            JSON.stringify({ error: "complaint_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: complaint, error: updateError } = await supabase
          .from("complaints")
          .update({
            status: "resolved",
            resolved_at: new Date().toISOString(),
            resolution_notes: body.resolution_notes || null,
          })
          .eq("id", body.complaint_id)
          .select()
          .single();

        if (updateError) {
          console.error("Error resolving complaint:", updateError);
          throw new Error("Failed to resolve complaint");
        }

        console.log(`Complaint ${complaint.ticket_number} resolved`);

        return new Response(
          JSON.stringify({ message: "Complaint resolved", complaint }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use: create, update_status, assign, or resolve" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error in complaint-handler:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
