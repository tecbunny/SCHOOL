import { NextResponse } from "next/server";
import { errorMessage, pickAllowed, requireUser } from "@/lib/api-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;
    const { id } = await params;

    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;
    const { id } = await params;
    const body = await req.json();
    const updates = pickAllowed(body, ["school_name", "status", "plan_type"]);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid school fields provided." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
