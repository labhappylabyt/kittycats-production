'use client'

import { useEffect, useState } from 'react'
import { tracks } from '@/config/site'
import {
  getProgress,
  getSnapshot,
  next,
  prev,
  seek,
  setVolume,
  subscribe,
  toggle,
} from '@/components/audio-engine'

/** How often the progress bar re-reads the clock. A 15s loop is smooth at 15fps. */
const PROGRESS_MS = 66

/**
 * The whole playback surface, backed by the shared audio engine. Every
 * component that calls this controls the same transport — the deck's cassette
 * and the full player stay in sync for free.
 */
export function usePlayer() {
  const [snapshot, setSnapshot] = useState(getSnapshot)
  const [progress, setProgress] = useState(0)

  useEffect(() => subscribe(setSnapshot), [])

  useEffect(() => {
    const id = setInterval(() => setProgress(getProgress()), PROGRESS_MS)
    return () => clearInterval(id)
  }, [])

  return {
    ...snapshot,
    track: tracks[snapshot.index],
    progress,
    toggle,
    next,
    prev,
    seek,
    setVolume,
  }
}
