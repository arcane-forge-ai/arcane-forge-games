import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CreateCommentRequest } from '@/types';
import { applyCors, getCorsHeaders } from '@/lib/cors';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('game_slug', slug)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch comments:', error);
      return applyCors(NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      ), request);
    }

    return applyCors(NextResponse.json({ comments: comments || [] }), request);
  } catch (error) {
    console.error('Unexpected error:', error);
    return applyCors(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ), request);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body: CreateCommentRequest = await request.json();

    // Validate required fields
    if (!body.name?.trim() || !body.text?.trim()) {
      return applyCors(NextResponse.json(
        { error: 'Name and text are required' },
        { status: 400 }
      ), request);
    }

    // Validate name length
    if (body.name.trim().length > 100) {
      return applyCors(NextResponse.json(
        { error: 'Name must be 100 characters or less' },
        { status: 400 }
      ), request);
    }

    // Validate text length
    if (body.text.trim().length > 2000) {
      return applyCors(NextResponse.json(
        { error: 'Comment must be 2000 characters or less' },
        { status: 400 }
      ), request);
    }

    // Check if the game exists
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('slug')
      .eq('slug', slug)
      .single();

    if (gameError || !game) {
      return applyCors(NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      ), request);
    }

    // If parent_id is provided, validate it exists
    if (body.parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', body.parent_id)
        .eq('game_slug', slug)
        .single();

      if (parentError || !parentComment) {
        return applyCors(NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 400 }
        ), request);
      }
    }

    // Insert the comment
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert({
        game_slug: slug,
        parent_id: body.parent_id || null,
        name: body.name.trim(),
        text: body.text.trim(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert comment:', insertError);
      return applyCors(NextResponse.json(
        { error: 'Failed to post comment' },
        { status: 500 }
      ), request);
    }

    return applyCors(NextResponse.json({ comment }, { status: 201 }), request);
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
