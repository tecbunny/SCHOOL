import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { requireUser } from '@/lib/api-auth';

const UPLOAD_DIR = path.join(os.tmpdir(), 'eduportal_uploads');
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Ensure unique upload session ID
function getUploadFilePath(uploadId: string) {
  return path.join(UPLOAD_DIR, `${uploadId}.part`);
}

function getUploadMetadataPath(uploadId: string) {
  return path.join(UPLOAD_DIR, `${uploadId}.meta`);
}

function isValidUploadId(uploadId: string | null): uploadId is string {
  return Boolean(uploadId && UUID_PATTERN.test(uploadId));
}

function parseUploadSize(value: string | null) {
  if (!value) return null;
  const size = Number(value);
  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_UPLOAD_BYTES) return null;
  return size;
}

// POST: Initialize upload session
export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(["admin", "principal", "teacher", "moderator", "student"]);
    if (!auth.ok) return auth.response;

    const uploadId = crypto.randomUUID();
    const filePath = getUploadFilePath(uploadId);
    const metaPath = getUploadMetadataPath(uploadId);

    const expectedSize = parseUploadSize(req.headers.get('Upload-Length'));
    if (!expectedSize) {
      return NextResponse.json({ error: 'Upload-Length must be a positive integer up to 10MB' }, { status: 400 });
    }

    // Initialize empty file and metadata
    fs.writeFileSync(filePath, '');
    fs.writeFileSync(metaPath, JSON.stringify({ expectedSize, currentOffset: 0 }));

    return NextResponse.json({ uploadId }, { 
      status: 201,
      headers: {
        'Location': `/api/upload/resumable?uploadId=${uploadId}`
      }
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// HEAD: Get current upload offset
export async function HEAD(req: NextRequest) {
  const auth = await requireUser(["admin", "principal", "teacher", "moderator", "student"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const uploadId = searchParams.get('uploadId');

  if (!isValidUploadId(uploadId)) {
    return new NextResponse(null, { status: 400 });
  }

  const metaPath = getUploadMetadataPath(uploadId);
  
  if (!fs.existsSync(metaPath)) {
    return new NextResponse(null, { status: 404 });
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Upload-Offset': meta.currentOffset.toString(),
      'Upload-Length': meta.expectedSize.toString()
    }
  });
}

// PATCH: Upload chunk
export async function PATCH(req: NextRequest) {
  const auth = await requireUser(["admin", "principal", "teacher", "moderator", "student"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const uploadId = searchParams.get('uploadId');
  const uploadOffsetStr = req.headers.get('Upload-Offset');

  if (!isValidUploadId(uploadId) || !uploadOffsetStr) {
    return NextResponse.json({ error: 'Missing uploadId or Upload-Offset' }, { status: 400 });
  }

  const uploadOffset = Number(uploadOffsetStr);
  if (!Number.isSafeInteger(uploadOffset) || uploadOffset < 0) {
    return NextResponse.json({ error: 'Upload-Offset must be a non-negative integer' }, { status: 400 });
  }
  const filePath = getUploadFilePath(uploadId);
  const metaPath = getUploadMetadataPath(uploadId);

  if (!fs.existsSync(filePath) || !fs.existsSync(metaPath)) {
    return NextResponse.json({ error: 'Upload session not found' }, { status: 404 });
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

  if (meta.currentOffset !== uploadOffset) {
    return NextResponse.json({ error: 'Conflict: Offset mismatch' }, { status: 409 });
  }

  try {
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (meta.currentOffset + buffer.length > meta.expectedSize) {
      return NextResponse.json({ error: 'Chunk exceeds declared upload size' }, { status: 413 });
    }

    fs.appendFileSync(filePath, buffer);

    meta.currentOffset += buffer.length;
    fs.writeFileSync(metaPath, JSON.stringify(meta));

    // If fully uploaded, here we would move it to Supabase storage.
    // For now, we simulate completion once expected size is reached.
    if (meta.currentOffset >= meta.expectedSize) {
       // e.g. upload to supabase logic
       // fs.unlinkSync(filePath);
       // fs.unlinkSync(metaPath);
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Upload-Offset': meta.currentOffset.toString()
      }
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
