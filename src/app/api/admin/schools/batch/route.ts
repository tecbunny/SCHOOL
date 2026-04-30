import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase-server';

export async function PATCH(req: Request) {
  try {
    const supabaseServer = await createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    // 1. Verify Super Admin role
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // 2. Parse batch request
    const { schoolIds, updates } = await req.json();
    
    if (!Array.isArray(schoolIds) || schoolIds.length === 0) {
      return NextResponse.json({ error: 'No schools selected for batch update.' }, { status: 400 });
    }

    // 3. Initialize Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 4. Execute Batch Update
    const { data, error } = await supabaseAdmin
      .from('schools')
      .update(updates)
      .in('id', schoolIds)
      .select();

    if (error) throw error;

    // 5. Success
    return NextResponse.json({
      success: true,
      updatedCount: data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Batch Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
