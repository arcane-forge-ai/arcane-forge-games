import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { applyCors, getCorsHeaders } from '@/lib/cors';

export async function GET(request: NextRequest) {
  try {
    const { data: games, error } = await supabaseService
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return applyCors(NextResponse.json(
        { error: 'Failed to fetch games' },
        { status: 500 }
      ), request);
    }

    return applyCors(NextResponse.json({ games: games || [] }), request);
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
