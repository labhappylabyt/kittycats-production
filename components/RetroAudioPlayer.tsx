'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';

interface RetroAudioPlayerProps {
  /** Point this at a real file in /public to play actual audio. */
  src?: string;
  title?: string;
}

const BARS = [1, 2, 3, 4, 5];
const FLAT_BARS = BARS.map(() => 0.2);

/**
 * ponytail: there is no audio file in this repo, so with no `src` the player
 * generates a silent WAV of a known length and plays that. Everything the UI
 * shows — position, duration, volume, play state — is read back off the real
 * media element, so it stays truthful either way. Drop a file in /public and
 * pass `src` and nothing else changes.
 */
function silentWavUrl(seconds: number, sampleRate = 8000) {
  const samples = seconds * sampleRate;
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  ascii(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // byte rate, 8-bit mono
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  ascii(36, 'data');
  view.setUint32(40, samples, true);
  new Uint8Array(buffer, 44).fill(128); // 8-bit PCM silence

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function RetroAudioPlayer({ src, title }: RetroAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const placeholderSrc = useMemo(() => (src ? null : silentWavUrl(20)), [src]);
  useEffect(() => {
    return () => {
      if (placeholderSrc) URL.revokeObjectURL(placeholderSrc);
    };
  }, [placeholderSrc]);

  // Every one of these is written by a media event, never by a click handler,
  // so the display can't claim a state the element isn't actually in.
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bars, setBars] = useState(FLAT_BARS);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolume = () => {
      setVolume(audio.volume);
      setMuted(audio.muted);
    };
    const onError = () => setError('This track could not be loaded.');

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);
    audio.addEventListener('volumechange', onVolume);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
      audio.removeEventListener('volumechange', onVolume);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // One interval driving all five bars, animating scaleY on the compositor
  // instead of height, which would relayout on every tick.
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;
    const id = setInterval(() => {
      setBars(BARS.map(() => 0.2 + Math.random() * 0.8));
    }, 400);
    return () => clearInterval(id);
  }, [isPlaying, reducedMotion]);

  // Flat whenever the bars aren't being driven, so stopping needs no state reset.
  const displayBars = isPlaying && !reducedMotion ? bars : FLAT_BARS;

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
      setError(null);
    } catch {
      setError('Playback was blocked by the browser.');
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = Math.round((muted ? 0 : volume) * 100);

  return (
    <div className="bg-surface backdrop-blur-md border-2 border-dashed border-pink-200 rounded-3xl p-4 max-w-xl mx-auto my-6">
      <audio ref={audioRef} src={src ?? placeholderSrc ?? undefined} preload="metadata" />

      <div className="flex flex-col items-center space-y-3">
        {/* Dark panel on purpose: the green terminal text was 1.26:1 against a
            light green wash, which is unreadable. */}
        <div className="w-full bg-green-950 border-2 border-green-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-green-400 font-mono">
              {isPlaying ? '● PLAYING' : '○ PAUSED'}
            </span>
            <span className="text-xs text-green-400 font-mono">VOL: {volumePercent}%</span>
          </div>

          <div className="text-center">
            <div className="font-mono text-green-400 text-sm">
              {title ?? (src ? 'Untitled track' : 'Silent placeholder')}
            </div>
            <div className="text-green-300 text-xs font-mono">
              {src ? 'loaded from src' : 'pass a src prop to play real audio'}
            </div>
          </div>

          <div
            className="w-full bg-green-800 h-1.5 rounded mt-3 mb-2"
            role="progressbar"
            aria-label="Track position"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration) || 0}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          >
            <div className="bg-green-400 h-1.5 rounded" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex justify-between text-xs text-green-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            className="inline-flex min-h-11 min-w-11 items-center justify-center bg-green-900 border border-green-800 rounded text-green-300 font-mono text-xs hover:bg-green-800 transition-colors"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          <label className="flex items-center space-x-2 text-xs text-green-400 font-mono">
            <span>Vol</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(e) => {
                const audio = audioRef.current;
                if (!audio) return;
                audio.muted = false;
                audio.volume = Number(e.target.value);
              }}
              className="w-20 accent-green-400"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              const audio = audioRef.current;
              if (audio) audio.muted = !audio.muted;
            }}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="inline-flex min-h-11 min-w-11 items-center justify-center bg-green-900 border border-green-800 rounded text-green-300 font-mono text-xs hover:bg-green-800 transition-colors"
          >
            {muted ? '🔇' : '🔊'}
          </button>

          <div className="flex space-x-1 h-4 items-end" aria-hidden="true">
            {displayBars.map((scale, idx) => (
              <div
                key={BARS[idx]}
                className="w-1.5 h-full bg-green-700 rounded transition-transform duration-500"
                style={{ transform: `scaleY(${scale})`, transformOrigin: 'bottom' }}
              />
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-500 font-mono">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
