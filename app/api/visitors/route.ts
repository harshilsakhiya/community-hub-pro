import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from("visitors")
      .select("*, units(block, unit_number)", { count: "exact" })
      .order("check_in_time", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Visitors fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch visitors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, purpose, unit_id, vehicle_number, logged_by } =
      await request.json();

    const { data, error } = await supabase
      .from("visitors")
      .insert({
        name,
        phone,
        purpose,
        unit_id,
        vehicle_number,
        logged_by,
        check_in_time: new Date().toISOString(),
      })
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        data: data?.[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Visitor creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create visitor record" },
      { status: 500 }
    );
  }
}
