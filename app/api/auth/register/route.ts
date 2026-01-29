import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone } = await request.json();

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Create user profile
    await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      full_name,
      phone,
    });

    // Assign default resident role
    await supabase.from("user_roles").insert({
      user_id: data.user.id,
      role: "resident",
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
