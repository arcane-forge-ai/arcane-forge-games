import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { applyCors, getCorsHeaders } from '@/lib/cors';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Fetch game details
    const { data: game, error: gameError } = await supabaseService
      .from('games')
      .select('*')
      .eq('slug', slug)
      .single();

    if (gameError || !game) {
      return applyCors(NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      ), request);
    }

    // Fetch or create stats
    let { data: stats, error: statsError } = await supabaseService
      .from('stats')
      .select('*')
      .eq('game_slug', slug)
      .single();

    if (statsError || !stats) {
      // Create initial stats if they don't exist
      const { data: newStats, error: createError } = await supabaseService
        .from('stats')
        .insert({
          game_slug: slug,
          plays: 0,
          likes: 0,
          dislikes: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create stats:', createError);
        return applyCors(NextResponse.json(
          { error: 'Failed to fetch game stats' },
          { status: 500 }
        ), request);
      }

      stats = newStats;
    }

    return applyCors(NextResponse.json({ game, stats }), request);
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
