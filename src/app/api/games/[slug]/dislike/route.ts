import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { applyCors, getCorsHeaders } from '@/lib/cors';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Use atomic increment function to avoid race conditions
    const { data: stats, error } = await supabaseService
      .rpc('increment_dislikes', {
        game_slug_param: slug
      })
      .single();

    if (error) {
      console.error('Failed to increment dislike count:', error);
      return applyCors(NextResponse.json(
        { error: 'Failed to record dislike' },
        { status: 500 }
      ), request);
    }

    return applyCors(NextResponse.json({ stats }), request);
  } catch (error) {
    console.error('Unexpected error:', error);
    return applyCors(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ), request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
