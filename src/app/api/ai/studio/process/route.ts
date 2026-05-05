import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simulated Edge Processor
export async function POST(req: Request) {
  try {
    const { generation_id } = await req.json();
    if (!generation_id) return NextResponse.json({ error: 'Missing generation_id' }, { status: 400 });

    // Use service role for backend processing to bypass RLS during processing
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update status to processing
    await supabase
      .from('generations')
      .update({ status: 'processing' })
      .eq('id', generation_id);

    // Simulate LLM processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Fetch generation to get type and school
    const { data: generation } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generation_id)
      .single();

    if (!generation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Generate mock asset
    const mockContent = {
      title: `Generated ${generation.generation_type.replace('_', ' ')}`,
      items: [
        { q: "Key concept 1", a: "Explanation 1" },
        { q: "Key concept 2", a: "Explanation 2" }
      ]
    };

    // Insert into assets table
    await supabase
      .from('generation_assets')
      .insert({
        generation_id: generation.id,
        school_id: generation.school_id,
        asset_type: generation.generation_type,
        content: mockContent,
        storage_path: `generations/${generation.id}.json`
      });

    // Mark as completed
    await supabase
      .from('generations')
      .update({ status: 'completed' })
      .eq('id', generation_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Edge Processor Error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}