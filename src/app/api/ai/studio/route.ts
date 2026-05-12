import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/api-auth';

const MAX_STUDIO_FILE_BYTES = 10 * 1024 * 1024;
const TYPE_MAP = {
  audio: 'audio_overview',
  flashcards: 'flashcards',
  quiz: 'interactive_quiz',
  slides: 'slide_deck'
} as const;

type StudioAssetType = keyof typeof TYPE_MAP;

function isStudioAssetType(type: FormDataEntryValue | null): type is StudioAssetType {
  return typeof type === 'string' && type in TYPE_MAP;
}

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["admin", "principal", "teacher", "moderator", "student"]);
    if (!auth.ok) return auth.response;

    const { supabase, profile, user } = auth.context;
    if (!profile.school_id) {
      return NextResponse.json({ error: 'School context is required.' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type');

    if (!(file instanceof File) || !isStudioAssetType(type)) {
      return NextResponse.json({ error: 'Missing file or asset type' }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_STUDIO_FILE_BYTES) {
      return NextResponse.json({ error: 'File must be between 1 byte and 10MB' }, { status: 413 });
    }

    // Insert into generations queue
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        school_id: profile.school_id,
        requester_id: user.id,
        generation_type: TYPE_MAP[type],
        status: 'pending',
        priority: 'normal',
        input_payload: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
        },
      })
      .select()
      .single();

    if (genError) throw genError;

    const processSecret = process.env.STUDIO_PROCESS_SECRET;
    if (processSecret) {
      fetch(new URL('/api/ai/studio/process', req.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-studio-process-secret': processSecret,
        },
        body: JSON.stringify({ generation_id: generation.id })
      }).catch(console.error);
    }

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
