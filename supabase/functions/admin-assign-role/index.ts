import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AssignRoleRequest {
  targetUserId: string;
  role: "admin" | "resident" | "gatekeeper" | "committee_member";
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

    const requestingUserId = userData.user.id;
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if requesting user is admin
    const { data: adminRole, error: adminError } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUserId)
      .eq("role", "admin")
      .single();

    if (adminError || !adminRole) {
      return new Response(JSON.stringify({ error: "Only admins can assign roles" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    const { targetUserId, role }: AssignRoleRequest = await req.json();

    if (!targetUserId || !role) {
      return new Response(JSON.stringify({ error: "Missing targetUserId or role" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const validRoles = ["admin", "resident", "gatekeeper", "committee_member"];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Update the user's role
    const { error: updateError } = await serviceClient
      .from("user_roles")
      .update({ role })
      .eq("user_id", targetUserId);

    if (updateError) {
      // If no existing role, insert new one
      if (updateError.code === "PGRST116") {
        const { error: insertError } = await serviceClient
          .from("user_roles")
          .insert({ user_id: targetUserId, role });
        
        if (insertError) throw insertError;
      } else {
        throw updateError;
      }
    }

    // Get updated user info
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", targetUserId)
      .single();

    console.log(`Role ${role} assigned to user ${targetUserId}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Role '${role}' assigned successfully`,
      user: profile,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error assigning role:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
