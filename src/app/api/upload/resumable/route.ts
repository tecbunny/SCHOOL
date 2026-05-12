import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

const UPLOAD_DIR = path.join(os.tmpdir(), 'eduportal_uploads');

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

// POST: Initialize upload session
export async function POST(req: NextRequest) {
  try {
    const uploadId = crypto.randomUUID();
    const filePath = getUploadFilePath(uploadId);
    const metaPath = getUploadMetadataPath(uploadId);

    const expectedSize = req.headers.get('Upload-Length');
    if (!expectedSize) {
      return NextResponse.json({ error: 'Upload-Length header is required' }, { status: 400 });
    }

    // Initialize empty file and metadata
    fs.writeFileSync(filePath, '');
    fs.writeFileSync(metaPath, JSON.stringify({ expectedSize: parseInt(expectedSize, 10), currentOffset: 0 }));

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
  const { searchParams } = new URL(req.url);
  const uploadId = searchParams.get('uploadId');

  if (!uploadId) {
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
  const { searchParams } = new URL(req.url);
  const uploadId = searchParams.get('uploadId');
  const uploadOffsetStr = req.headers.get('Upload-Offset');

  if (!uploadId || !uploadOffsetStr) {
    return NextResponse.json({ error: 'Missing uploadId or Upload-Offset' }, { status: 400 });
  }

  const uploadOffset = parseInt(uploadOffsetStr, 10);
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

    return NextResponse.json({ success: true, offset: meta.currentOffset }, {
      status: 204,
      headers: {
        'Upload-Offset': meta.currentOffset.toString()
      }
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
