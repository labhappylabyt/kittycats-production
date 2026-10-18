'use client';

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

interface SplashScreenProps {
  children: React.ReactNode;
}

/**
 * Renders `children` unconditionally so the real page is in the server HTML.
 * The splash is an overlay on top of it, not a replacement for it — the old
 * version returned only the splash while its timer ran, which meant no route
 * shipped any of its content to crawlers, no-JS clients, or assistive tech.
 */
export default function SplashScreenWrapper({ children }: SplashScreenProps) {
  const [dismissed, setDismissed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const dismiss = () => setDismissed(true);
    const timer = setTimeout(dismiss, 1500);

    // Any interaction dismisses it, so a keyboard user who tabs through the
    // overlay isn't left focusing elements hidden behind it.
    window.addEventListener('keydown', dismiss);
    window.addEventListener('pointerdown', dismiss);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', dismiss);
      window.removeEventListener('pointerdown', dismiss);
    };
  }, []);

  // Anyone who has asked for less motion never sees it at all.
  const showSplash = !dismissed && !reducedMotion;

  return (
    <>
      {children}
      {showSplash && (
        <div
          id="splash"
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100"
        >
          {/* Without JS the timer never fires, so the overlay would sit over
              the page forever. */}
          <noscript>
            <style>{`#splash { display: none }`}</style>
          </noscript>
          <div className="text-center space-y-6">
            <div className="text-6xl" aria-hidden="true">
              🐱
            </div>
            <p className="font-mono text-4xl text-pink-800">kittycats.cc</p>
            <p className="text-lg text-pink-700">
              Entering the cottagecore wonderland...
            </p>
            <div className="flex justify-center space-x-4" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="motion-safe:animate-pulse">
                  ✨
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="inline-flex min-h-11 items-center rounded-full border border-pink-500/30 bg-pink-500/20 px-5 text-sm font-medium text-pink-800 transition-colors hover:bg-pink-500/30"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </>
  );
}
