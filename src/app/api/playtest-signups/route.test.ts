/** @jest-environment node */

import { NextRequest } from 'next/server';
import * as route from './route';

describe('playtest signup route', () => {
  it('does not expose a GET handler', () => {
    expect('GET' in route).toBe(false);
  });

  it('requires JSON requests', async () => {
    const response = await route.POST(new NextRequest('http://localhost/api/playtest-signups', {
      method: 'POST',
      body: 'email=tester@example.com',
    }));
    expect(response.status).toBe(415);
  });

  it('accepts honeypot submissions without database access', async () => {
    const response = await route.POST(new NextRequest('http://localhost/api/playtest-signups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website: 'spam.example' }),
    }));
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
