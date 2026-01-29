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
    const limit = 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("maintenance_bills")
      .select("*, units(block, unit_number)", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
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
    console.error("Bills fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, billing_month, due_date, unit_id } = await request.json();

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    const { data, error } = await supabase
      .from("maintenance_bills")
      .insert({
        invoice_number: invoiceNumber,
        amount,
        billing_month,
        due_date,
        unit_id,
        status: "pending",
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
    console.error("Bill creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create bill" },
      { status: 500 }
    );
  }
}
