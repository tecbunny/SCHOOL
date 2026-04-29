import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('platform_config')
      .select('*');

    if (error) {
      if (error.code === '42P01') return NextResponse.json({});
      throw error;
    }

    // Convert array to object
    const config = data.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { key, value } = await req.json();

    const { data, error } = await supabase
      .from('platform_config')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
