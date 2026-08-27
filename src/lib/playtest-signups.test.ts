import { registerPlaytestSignup, SignupInsert } from '@/lib/playtest-signups';

const validSignup = {
  name: '  Ada  ',
  email: '  ADA@Example.com ',
  platform: 'macos',
  consent: true,
};

describe('registerPlaytestSignup', () => {
  it('normalizes and inserts a valid signup', async () => {
    const insert: SignupInsert = jest.fn().mockResolvedValue({ error: null });

    await expect(registerPlaytestSignup(validSignup, insert)).resolves.toEqual({ ok: true, status: 202 });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Ada',
      email: 'ada@example.com',
      platform: 'macos',
      consent_version: 'crazy-chess-playtest-v1',
      source_route: '/crazy-chess-project',
    }));
  });

  it.each([
    [{ ...validSignup, email: 'not-an-email' }, 'Enter a valid email address.'],
    [{ ...validSignup, platform: 'linux' }, 'Choose a supported playtest platform.'],
    [{ ...validSignup, consent: false }, 'Playtest contact consent is required.'],
    [{ ...validSignup, name: 'x'.repeat(101) }, 'Name must be 100 characters or fewer.'],
  ])('rejects invalid input', async (input, error) => {
    const insert: SignupInsert = jest.fn();
    await expect(registerPlaytestSignup(input, insert)).resolves.toEqual({ ok: false, status: 400, error });
    expect(insert).not.toHaveBeenCalled();
  });

  it('silently accepts a honeypot submission without writing', async () => {
    const insert: SignupInsert = jest.fn();
    await expect(registerPlaytestSignup({ website: 'spam.example' }, insert)).resolves.toEqual({ ok: true, status: 202 });
    expect(insert).not.toHaveBeenCalled();
  });

  it('returns the same accepted response for an existing email', async () => {
    const insert: SignupInsert = jest.fn().mockResolvedValue({ error: { code: '23505' } });
    await expect(registerPlaytestSignup(validSignup, insert)).resolves.toEqual({ ok: true, status: 202 });
  });

  it('returns a retryable error without logging PII', async () => {
    const insert: SignupInsert = jest.fn().mockResolvedValue({ error: { code: '08006' } });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(registerPlaytestSignup(validSignup, insert)).resolves.toEqual({
      ok: false,
      status: 500,
      error: 'We could not save your signup. Please try again.',
    });
    expect(JSON.stringify(consoleSpy.mock.calls)).not.toContain('ada@example.com');
    consoleSpy.mockRestore();
  });
});
