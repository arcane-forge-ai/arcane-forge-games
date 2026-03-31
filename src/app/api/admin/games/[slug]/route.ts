import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { UpdateGameRequest } from '@/types';
import { applyCors, getCorsHeaders } from '@/lib/cors';

function checkAdminAuth(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) return false;
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token === adminToken;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!checkAdminAuth(request)) {
      return applyCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request);
    }

    const { slug } = params;
    const body: UpdateGameRequest = await request.json();

    const updates: Partial<UpdateGameRequest> = {};
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description.trim();
    if (body.icon_url !== undefined) updates.icon_url = body.icon_url.trim() || '/logo.png';
    if (body.screenshot_url !== undefined) updates.screenshot_url = body.screenshot_url.trim() || '/placeholder-screenshot.png';
    if (body.game_url !== undefined) updates.game_url = body.game_url.trim();

    if (Object.keys(updates).length === 0) {
      return applyCors(
        NextResponse.json({ error: 'No fields to update' }, { status: 400 }),
        request
      );
    }

    const { data: game, error } = await supabaseService
      .from('games')
      .update(updates)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Failed to update game:', error);
      return applyCors(
        NextResponse.json({ error: 'Failed to update game' }, { status: 500 }),
        request
      );
    }

    if (!game) {
      return applyCors(NextResponse.json({ error: 'Game not found' }, { status: 404 }), request);
    }

    return applyCors(NextResponse.json({ game }), request);
  } catch (error) {
    console.error('Unexpected error:', error);
    return applyCors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }), request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}
