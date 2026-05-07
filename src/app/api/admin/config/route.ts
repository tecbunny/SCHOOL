import { NextResponse } from "next/server";
import { errorMessage, requireUser } from "@/lib/api-auth";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;
    const { data, error } = await supabase
      .from('platform_config')
      .select('*');

    if (error) {
      if (error.code === '42P01') return NextResponse.json({});
      throw error;
    }

    // Convert array to object
    const config = (data as Array<{ key: string; value: unknown }>).reduce((acc: Record<string, unknown>, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return NextResponse.json(config);
  } catch (error: unknown) {
    console.error("Error in admin config GET route:", error);
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
    const { key, value } = await req.json();
    const allowedKeys = new Set(["maintenance_mode", "registration_enabled", "default_plan", "support_email"]);

    if (typeof key !== "string" || !allowedKeys.has(key)) {
      return NextResponse.json({ error: "Unsupported platform config key." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('platform_config')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error in admin config PATCH route:", error);
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
