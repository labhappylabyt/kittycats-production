'use client';

import Link from 'next/link';
import { useState } from 'react';
import RetroAudioPlayer from '@/components/RetroAudioPlayer';

const CARDS = [
  { id: 1, label: 'Twitter', icon: '🐦' },
  { id: 2, label: 'Instagram', icon: '📸' },
  { id: 3, label: 'GitHub', icon: '💻' },
  { id: 4, label: 'Discord', icon: '🎮' },
  { id: 5, label: 'YouTube', icon: '📺' },
];

export default function Lab() {
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const isPaused = isHovered || isManuallyPaused;

  // The second half only exists so translateX(-50%) loops seamlessly.
  const allCards = [
    ...CARDS.map((card) => ({ ...card, clone: false })),
    ...CARDS.map((card) => ({ ...card, clone: true })),
  ];

  return (
    <>
      {/* Top navigation */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center px-4 bg-surface backdrop-blur-md border-2 border-dashed border-pink-200 rounded-xl text-pink-800 hover:text-pink-700 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main content */}
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <h1 className="mb-4 text-2xl font-bold text-pink-800">Social Deck</h1>

        <button
          type="button"
          onClick={() => setIsManuallyPaused((paused) => !paused)}
          aria-pressed={isManuallyPaused}
          className="mb-6 inline-flex min-h-11 items-center px-4 bg-surface backdrop-blur-md border-2 border-dashed border-pink-200 rounded-xl text-pink-800 hover:text-pink-700 transition-colors"
        >
          {isManuallyPaused ? '▶ Resume carousel' : '❚❚ Pause carousel'}
        </button>

        {/* Infinite marquee container */}
        <div
          className="relative w-full max-w-6xl overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
        >
          <ul
            className="marquee flex gap-8 list-none p-0 m-0"
            data-paused={isPaused}
          >
            {allCards.map((card) => (
              <li
                key={card.clone ? `clone-${card.id}` : card.id}
                data-clone={card.clone}
                className={`w-64 h-88 shrink-0 flex flex-col items-center justify-center bg-surface backdrop-blur-md border-2 border-dashed border-pink-200 rounded-3xl p-4 ${
                  card.id % 2 === 0 ? 'translate-y-4' : '-translate-y-4'
                }`}
              >
                <span className="text-4xl mb-2" aria-hidden="true">
                  {card.icon}
                </span>
                <p className="font-bold text-pink-800">{card.label}</p>
              </li>
            ))}
          </ul>
        </div>

        <RetroAudioPlayer />
      </main>

      <footer className="py-6 text-center text-sm text-pink-700">
        © 2026 kittycats.cc
      </footer>
    </>
  );
}
