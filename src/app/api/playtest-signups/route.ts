import { NextRequest, NextResponse } from 'next/server';
import { registerPlaytestSignup } from '@/lib/playtest-signups';

export async function POST(request: NextRequest) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json(
      { ok: false, error: 'Content-Type must be application/json.' },
      { status: 415, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON request.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const result = await registerPlaytestSignup(body);
  return NextResponse.json(
    result.ok ? { ok: true } : { ok: false, error: result.error },
    { status: result.status, headers: { 'Cache-Control': 'no-store' } },
  );
}
