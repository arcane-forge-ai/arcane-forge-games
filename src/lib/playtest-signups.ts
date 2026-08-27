import { validateEmail } from '@/lib/utils';

export const PLAYTEST_PLATFORMS = ['windows', 'macos', 'android', 'ios'] as const;
export const PLAYTEST_CONSENT_VERSION = 'crazy-chess-playtest-v1';

export type PlaytestPlatform = (typeof PLAYTEST_PLATFORMS)[number];

export interface PlaytestSignupRecord {
  email: string;
  name: string | null;
  platform: PlaytestPlatform;
  consent_version: string;
  consent_at: string;
  source_route: string;
}

interface DatabaseError {
  code?: string;
}

export type SignupInsert = (record: PlaytestSignupRecord) => Promise<{ error: DatabaseError | null }>;

export type PlaytestSignupResult =
  | { ok: true; status: 202 }
  | { ok: false; status: 400; error: string }
  | { ok: false; status: 500; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function accepted(): PlaytestSignupResult {
  return { ok: true, status: 202 };
}

const defaultInsert: SignupInsert = async (record) => {
  const { supabaseService } = await import('@/lib/supabase');
  const { error } = await supabaseService.from('playtest_signups').insert(record);
  return { error };
};

export async function registerPlaytestSignup(
  input: unknown,
  insertSignup: SignupInsert = defaultInsert,
): Promise<PlaytestSignupResult> {
  if (!isRecord(input)) {
    return { ok: false, status: 400, error: 'Invalid signup request.' };
  }

  if (typeof input.website === 'string' && input.website.trim()) {
    return accepted();
  }

  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const platform = typeof input.platform === 'string' ? input.platform : '';

  if (!email || email.length > 320 || !validateEmail(email)) {
    return { ok: false, status: 400, error: 'Enter a valid email address.' };
  }

  if (name.length > 100) {
    return { ok: false, status: 400, error: 'Name must be 100 characters or fewer.' };
  }

  if (!PLAYTEST_PLATFORMS.includes(platform as PlaytestPlatform)) {
    return { ok: false, status: 400, error: 'Choose a supported playtest platform.' };
  }

  if (input.consent !== true) {
    return { ok: false, status: 400, error: 'Playtest contact consent is required.' };
  }

  const { error } = await insertSignup({
    email,
    name: name || null,
    platform: platform as PlaytestPlatform,
    consent_version: PLAYTEST_CONSENT_VERSION,
    consent_at: new Date().toISOString(),
    source_route: '/crazy-chess-project',
  });

  if (!error || error.code === '23505') {
    return accepted();
  }

  console.error('Playtest signup insert failed.', { code: error.code || 'unknown' });
  return { ok: false, status: 500, error: 'We could not save your signup. Please try again.' };
}
