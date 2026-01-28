import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: "resident" | "gatekeeper";
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify requesting user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      .maybeSingle();

    if (adminError || !adminRole) {
      return new Response(JSON.stringify({ error: "Only admins can create users" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, fullName, phone, role }: CreateUserRequest = await req.json();

    // Validate input
    if (!email || !password || !fullName || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields: email, password, fullName, role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRoles = ["resident", "gatekeeper"];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role. Must be 'resident' or 'gatekeeper'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create user with admin API
    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        phone: phone || null,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The trigger should create profile and default role, but let's update the role
    // Wait a bit for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the user's role to the specified role
    const { error: roleError } = await serviceClient
      .from("user_roles")
      .update({ role })
      .eq("user_id", newUser.user.id);

    if (roleError) {
      // If update fails, try insert
      const { error: insertError } = await serviceClient
        .from("user_roles")
        .upsert({ user_id: newUser.user.id, role }, { onConflict: 'user_id' });
      
      if (insertError) {
        console.error("Error setting role:", insertError);
      }
    }

    // Update profile with phone if provided
    if (phone) {
      await serviceClient
        .from("profiles")
        .update({ phone })
        .eq("id", newUser.user.id);
    }

    console.log(`User ${email} created with role ${role} by admin ${requestingUserId}`);

    return new Response(JSON.stringify({
      success: true,
      message: `User created successfully with role '${role}'`,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        fullName,
        role,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
