'use client';

import { FormEvent, useState } from 'react';
import styles from '@/app/crazy-chess-project/page.module.css';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function PlaytestSignupForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const platform = String(data.get('platform') || '');
    const consent = data.get('consent') === 'on';

    if (!email || !platform || !consent) {
      setError('Enter your email, choose a platform, and confirm playtest contact consent.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setError('');

    try {
      const response = await fetch('/api/playtest-signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name') || '').trim(),
          email,
          platform,
          consent,
          website: String(data.get('website') || ''),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'We could not save your signup.');
      }

      form.reset();
      setStatus('success');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'We could not save your signup.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.formSuccess} role="status">
        <span aria-hidden="true">✓</span>
        <div>
          <strong>You’re on the playtest list.</strong>
          <p>We’ll use your email only to contact you about Crazy Chess playtesting.</p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.signupForm} onSubmit={handleSubmit} noValidate>
      {status === 'error' && <p className={styles.formError} role="alert">{error}</p>}
      <div className={styles.formGrid}>
        <label>
          <span>Name <em>optional</em></span>
          <input name="name" type="text" autoComplete="name" maxLength={100} placeholder="Your name" disabled={status === 'submitting'} />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" maxLength={320} placeholder="you@example.com" required disabled={status === 'submitting'} />
        </label>
        <label className={styles.platformField}>
          <span>Preferred platform</span>
          <select name="platform" defaultValue="" required disabled={status === 'submitting'}>
            <option value="" disabled>Choose a platform</option>
            <option value="windows">Windows</option>
            <option value="macos">macOS</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
          </select>
        </label>
      </div>
      <label className={styles.honeypot} aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <label className={styles.consentField}>
        <input name="consent" type="checkbox" required disabled={status === 'submitting'} />
        <span>I agree that Arcane Forge may email me about Crazy Chess playtesting. I can ask to be removed at any time.</span>
      </label>
      <button type="submit" className={styles.submitButton} disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Joining…' : 'Join the Playtest'}
      </button>
    </form>
  );
}
