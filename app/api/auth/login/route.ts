import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", data.user.id)
      .single();

    return NextResponse.json(
      {
        success: true,
        data: {
          token: data.session?.access_token,
          user: {
            id: data.user.id,
            email: data.user.email,
            full_name: profile?.full_name,
            phone: profile?.phone,
            avatar_url: profile?.avatar_url,
            role: profile?.user_roles?.[0]?.role || "resident",
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
