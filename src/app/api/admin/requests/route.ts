import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { errorMessage, requireUser } from "@/lib/api-auth";
import { isRateLimited } from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;

    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty list (for initial dev)
      if (error.code === '42P01') return NextResponse.json([]);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error in admin requests GET route:", error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: errorMessage(error), code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (isRateLimited(req, "registration-request", { limit: 5, windowMs: 60_000 })) {
      return NextResponse.json({ error: "Too many registration attempts." }, { status: 429 });
    }

    const supabase = await createClient();
    const { school_name, udise_code, applicant_name, applicant_email } = await req.json();

    if (
      typeof school_name !== "string" ||
      typeof udise_code !== "string" ||
      typeof applicant_name !== "string" ||
      typeof applicant_email !== "string" ||
      school_name.trim().length < 2 ||
      udise_code.trim().length !== 11 ||
      applicant_name.trim().length < 2 ||
      !applicant_email.includes("@")
    ) {
      return NextResponse.json({ error: "Valid school, U-DISE, applicant, and email details are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('registration_requests')
      .insert({
        school_name: school_name.trim(),
        udise_code: udise_code.trim(),
        applicant_name: applicant_name.trim(),
        applicant_email: applicant_email.trim(),
        contact_email: applicant_email.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error in admin requests POST route:", error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: errorMessage(error), code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;
    const { id, status } = await req.json();
    const allowedStatuses = new Set(["pending", "approved", "rejected"]);

    if (!id || !allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Valid request id and status are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('registration_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error in admin requests PATCH route:", error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: errorMessage(error), code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
