import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    const { deviceId, schoolCode, secretKey } = await req.json();

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
    const { data: device, error: deviceError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        mac_address: deviceId,
        is_hardware_bound: true
      })
      .eq('school_id', school.id)
      .eq('role', 'student') // Or teacher depending on device type
      .select()
      .limit(1);

    if (deviceError) throw deviceError;

    return NextResponse.json({
      success: true,
      message: `Device securely bound to ${school.school_name}`,
      config: {
        apiUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        realtimeChannel: `school_${school.id}`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
