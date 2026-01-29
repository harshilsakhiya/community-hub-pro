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
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("complaints")
      .select("*, units(block, unit_number), profiles(full_name)", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
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
    console.error("Complaints fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, priority, unit_id, submitted_by } =
      await request.json();

    // Generate ticket number
    const ticketNumber = `CMP-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    const { data, error } = await supabase
      .from("complaints")
      .insert({
        ticket_number: ticketNumber,
        title,
        description,
        category: category || "other",
        priority: priority || "medium",
        status: "open",
        unit_id,
        submitted_by,
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
    console.error("Complaint creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create complaint" },
      { status: 500 }
    );
  }
}
