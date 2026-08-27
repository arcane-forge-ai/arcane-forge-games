'use client';

import { useEffect, useRef, useState } from 'react';

interface GameplayVideoProps {
  src: string;
  poster: string;
  label: string;
  autoPlay?: boolean;
  className?: string;
}

export default function GameplayVideo({
  src,
  poster,
  label,
  autoPlay = false,
  className,
}: GameplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [motionPreferenceKnown, setMotionPreferenceKnown] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(autoPlay);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setReduceMotion(media.matches);
      setMotionPreferenceKnown(true);
    };
    updatePreference();
    media.addEventListener?.('change', updatePreference);
    return () => media.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => {
    if (autoPlay || shouldLoad) return;

    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '320px 0px' },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [autoPlay, shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    video.load();
    if (reduceMotion) {
      video.pause();
    } else if (autoPlay && motionPreferenceKnown) {
      void video.play().catch(() => {
        // Browser autoplay policies may still require a user gesture.
      });
    }
  }, [autoPlay, motionPreferenceKnown, reduceMotion, shouldLoad]);

  return (
    <video
      ref={videoRef}
      className={className}
      aria-label={label}
      autoPlay={autoPlay && motionPreferenceKnown && !reduceMotion}
      controls
      loop
      muted
      playsInline
      poster={poster}
      preload={autoPlay ? 'metadata' : 'none'}
    >
      {shouldLoad ? <source src={src} type="video/mp4" /> : null}
      Your browser does not support embedded gameplay video.
    </video>
  );
}
