'use client';

import Image from 'next/image';
import { useCallback } from 'react';

interface GameEmbedProps {
  gameUrl: string;
  title: string;
  gameSlug: string;
  screenshotUrl?: string;
}

export default function GameEmbed({ gameUrl, title, gameSlug, screenshotUrl }: GameEmbedProps) {
  const handleOpen = useCallback(async () => {
    try {
      window.open(gameUrl, '_blank', 'noopener,noreferrer');

      // Record play and emit event so in-page stats can update immediately
      const res = await fetch(`/api/games/${gameSlug}/play`, { method: 'POST' });
      if (res.ok) {
        try {
          const event = new CustomEvent('game:play-recorded', { detail: { gameSlug } });
          window.dispatchEvent(event);
        } catch {}
      }
    } catch {}
  }, [gameUrl, gameSlug]);

  return (
    <div className="relative aspect-video bg-gray-100">
      {screenshotUrl ? (
        <Image
          src={screenshotUrl}
          alt={`${title} screenshot`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <span className="text-sm">No screenshot available</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleOpen}
        className="absolute inset-0 group"
        aria-label={`Play ${title}`}
      >
        <span className="absolute inset-0 bg-black/30 opacity-100 group-hover:bg-black/40 transition-colors"></span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/90 group-hover:bg-white shadow-lg transition-transform group-hover:scale-105">
            <svg className="w-8 h-8 text-gray-900" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7-11-7z" />
            </svg>
          </span>
        </span>
      </button>
    </div>
  );
}