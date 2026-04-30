import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { errorMessage, getServiceClient, pickAllowed, requireUser } from '@/lib/api-auth';

export async function PATCH(req: Request) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;

    // 2. Parse batch request
    const { schoolIds, updates } = await req.json();
    const allowedUpdates = pickAllowed(updates || {}, ["status", "plan_type"]);
    
    if (!Array.isArray(schoolIds) || schoolIds.length === 0) {
      return NextResponse.json({ error: 'No schools selected for batch update.' }, { status: 400 });
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid batch update fields provided.' }, { status: 400 });
    }

    // 3. Initialize Admin Client
    const service = getServiceClient();
    const supabaseAdmin = createClient(
      service.url,
      service.key,
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
      .update(allowedUpdates)
      .in('id', schoolIds)
      .select();

    if (error) throw error;

    // 5. Success
    return NextResponse.json({
      success: true,
      updatedCount: data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('Batch Update Error:', error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
