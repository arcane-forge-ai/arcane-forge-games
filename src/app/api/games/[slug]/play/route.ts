import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Use atomic increment function to avoid race conditions
    const { data: stats, error } = await supabaseService
      .rpc('increment_plays', {
        game_slug_param: slug
      })
      .single();

    if (error) {
      console.error('Failed to increment play count:', error);
      return NextResponse.json(
        { error: 'Failed to record play' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 