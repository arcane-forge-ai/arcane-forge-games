import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PlaytestSignupForm from './PlaytestSignupForm';

describe('PlaytestSignupForm', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('shows inline validation before submitting', () => {
    render(<PlaytestSignupForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Join the Playtest' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email');
  });

  it('submits and displays the success state', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    global.fetch = fetchMock;
    render(<PlaytestSignupForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'tester@example.com' } });
    fireEvent.change(screen.getByLabelText('Preferred platform'), { target: { value: 'android' } });
    fireEvent.click(screen.getByLabelText(/I agree that Arcane Forge/));
    fireEvent.click(screen.getByRole('button', { name: 'Join the Playtest' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('You’re on the playtest list.'));
    expect(fetchMock).toHaveBeenCalledWith('/api/playtest-signups', expect.objectContaining({ method: 'POST' }));
  });

  it('keeps the form available after a retryable error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Please try again.' }),
    });
    render(<PlaytestSignupForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'tester@example.com' } });
    fireEvent.change(screen.getByLabelText('Preferred platform'), { target: { value: 'ios' } });
    fireEvent.click(screen.getByLabelText(/I agree that Arcane Forge/));
    fireEvent.click(screen.getByRole('button', { name: 'Join the Playtest' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Please try again.'));
    expect(screen.getByRole('button', { name: 'Join the Playtest' })).toBeEnabled();
  });
});
