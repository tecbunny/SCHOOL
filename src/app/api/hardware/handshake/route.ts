import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/api-auth';
import { AppError } from "@/lib/errors";
import { safeSecretEquals } from '@/lib/secrets';

export async function POST(req: Request) {
  try {
    const service = getServiceClient();
    const supabaseAdmin = createClient(
      service.url,
      service.key
    );
    const { deviceId, schoolCode, secretKey, studentCode } = await req.json();

    if (!safeSecretEquals(secretKey, process.env.HARDWARE_PROVISIONING_SECRET)) {
      return NextResponse.json({ error: 'Invalid provisioning secret.' }, { status: 401 });
    }

    if (!deviceId || !schoolCode || !studentCode) {
      return NextResponse.json({ error: 'Device id, school code, and student code are required.' }, { status: 400 });
    }

    // 1. Verify School Code
    const { data: school, error: schoolError } = await supabaseAdmin
      .from('schools')
      .select('id, school_name')
      .eq('school_code', schoolCode)
      .single();

    if (schoolError || !school) {
      return NextResponse.json({ error: 'Invalid school code.' }, { status: 404 });
    }

    // 2. Register Device
    // In a real scenario, we would verify the secretKey against the school's provisioned keys
    const { error: deviceError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        mac_address: deviceId,
        is_hardware_bound: true
      })
      .eq('school_id', school.id)
      .eq('role', 'student')
      .eq('user_code', studentCode)
      .select()
      .single();

    if (deviceError) throw deviceError;

    return NextResponse.json({
      success: true,
      message: `Device securely bound to ${school.school_name}`,
      config: {
        apiUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        realtimeChannel: `school_${school.id}`
      }
    });

  } catch (error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  console.error("[POST] Unhandled Error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
}
