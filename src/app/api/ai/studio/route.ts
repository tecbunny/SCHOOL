import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json({ error: 'Missing file or asset type' }, { status: 400 });
    }

    // Map frontend types to DB types
    const typeMap: Record<string, string> = {
      'audio': 'audio_overview',
      'flashcards': 'flashcards',
      'quiz': 'interactive_quiz',
      'slides': 'slide_deck'
    };
    const dbType = typeMap[type] || 'audio_overview';

    // Insert into generations queue
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        school_id: profile?.school_id,
        requester_id: user.id,
        generation_type: dbType,
        status: 'pending',
        priority: 'normal'
      })
      .select()
      .single();

    if (genError) throw genError;

    // Trigger background processing (simulating edge node pickup)
    fetch(new URL('/api/ai/studio/process', req.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generation_id: generation.id })
    }).catch(console.error);

    return NextResponse.json({ 
      success: true, 
      message: `${type} generation queued successfully.`,
      generation
    });
  } catch (error) {
    console.error('Studio Queuing Error:', error);
    return NextResponse.json({ error: 'Failed to queue request' }, { status: 500 });
  }
}
