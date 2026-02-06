import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { CreateFeedbackRequest } from '@/types';
import { validateEmail } from '@/lib/utils';
import { applyCors, getCorsHeaders } from '@/lib/cors';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Check if the game exists
    const { data: game, error: gameError } = await supabaseService
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

    // Fetch all feedback for the game
    const { data: feedbacks, error: feedbackError } = await supabaseService
      .from('feedback_requests')
      .select('*')
      .eq('game_slug', slug)
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('Failed to fetch feedbacks:', feedbackError);
      return applyCors(NextResponse.json(
        { error: 'Failed to fetch feedbacks' },
        { status: 500 }
      ), request);
    }

    return applyCors(NextResponse.json({ feedbacks: feedbacks || [] }), request);
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
    const body: CreateFeedbackRequest = await request.json();

    // Validate required fields
    if (!body.message?.trim()) {
      return applyCors(NextResponse.json(
        { error: 'Feedback message is required' },
        { status: 400 }
      ), request);
    }

    // Validate message length
    if (body.message.trim().length > 5000) {
      return applyCors(NextResponse.json(
        { error: 'Feedback message must be 5000 characters or less' },
        { status: 400 }
      ), request);
    }

    // Validate email if provided
    if (body.email && !validateEmail(body.email)) {
      return applyCors(NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      ), request);
    }

    // If want_notify is true, email must be provided
    if (body.want_notify && !body.email?.trim()) {
      return applyCors(NextResponse.json(
        { error: 'Email is required if you want to be notified' },
        { status: 400 }
      ), request);
    }

    // Check if the game exists
    const { data: game, error: gameError } = await supabaseService
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

    // Insert the feedback
    const { data: feedback, error: insertError } = await supabaseService
      .from('feedback_requests')
      .insert({
        game_slug: slug,
        message: body.message.trim(),
        email: body.email?.trim() || null,
        want_notify: body.want_notify || false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert feedback:', insertError);
      return applyCors(NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      ), request);
    }

    return applyCors(NextResponse.json({ feedback }, { status: 201 }), request);
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
