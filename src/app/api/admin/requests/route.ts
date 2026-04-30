import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { errorMessage, requireUser } from "@/lib/api-auth";

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
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { school_name, udise_code, applicant_name, applicant_email } = await req.json();

    const { data, error } = await supabase
      .from('registration_requests')
      .insert({ school_name, udise_code, applicant_name, applicant_email })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
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
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
