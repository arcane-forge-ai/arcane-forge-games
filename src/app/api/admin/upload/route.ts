import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { applyCors, getCorsHeaders } from '@/lib/cors';

function checkAdminAuth(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) return false;
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token === adminToken;
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return applyCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const gameSlug = formData.get('game_slug') as string | null;
    const type = formData.get('type') as 'icon' | 'screenshot' | null;

    if (!file || !gameSlug || !type) {
      return applyCors(
        NextResponse.json({ error: 'file, game_slug, and type are required' }, { status: 400 }),
        request
      );
    }

    if (!['icon', 'screenshot'].includes(type)) {
      return applyCors(
        NextResponse.json({ error: 'type must be "icon" or "screenshot"' }, { status: 400 }),
        request
      );
    }

    const ext = file.name.split('.').pop() || 'png';
    const path = `${gameSlug}/${type}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseService.storage
      .from('public-storage')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return applyCors(
        NextResponse.json({ error: 'Failed to upload file' }, { status: 500 }),
        request
      );
    }

    const { data: urlData } = supabaseService.storage
      .from('public-storage')
      .getPublicUrl(path);

    return applyCors(NextResponse.json({ url: urlData.publicUrl }), request);
  } catch (error) {
    console.error('Unexpected error:', error);
    return applyCors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }), request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}
