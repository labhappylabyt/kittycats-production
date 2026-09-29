'use client'

/**
 * The site's single audio graph.
 *
 * One AudioContext, two buses. The spectrum analyser taps the music bus only,
 * so a card hover never makes the visualizer jump. Everything audible routes
 * through here because browsers cap how many contexts a page may open, and a
 * second context would also mean two melodies playing over each other.
 */

import { tracks } from '@/config/site'

export type PlayerSnapshot = {
  index: number
  playing: boolean
  volume: number
}

export type ScheduledNote = {
  freq: number
  /** seconds from the seek point until this note sounds */
  offset: number
  /** seconds this note sounds for */
  duration: number
}

/**
 * Which notes still need playing when starting `from` seconds into the loop,
 * and for how long. A note straddling `from` is clipped to its remainder.
 *
 * Pure on purpose: the seek maths is the part worth checking, and this way it
 * can be checked without a Web Audio graph.
 */
export function notesFrom(
  melody: Array<[number, number]>,
  from: number,
): ScheduledNote[] {
  const out: ScheduledNote[] = []
  let cursor = 0
  for (const [freq, dur] of melody) {
    const start = cursor
    const end = start + dur
    cursor = end
    if (end <= from) continue
    const playFrom = Math.max(start, from)
    out.push({ freq, offset: playFrom - from, duration: end - playFrom })
  }
  return out
}

export function melodyLength(melody: Array<[number, number]>) {
  return melody.reduce((sum, [, dur]) => sum + dur, 0)
}

let ctx: AudioContext | null = null
let musicBus: GainNode | null = null
let sfxBus: GainNode | null = null
let analyser: AnalyserNode | null = null

let snapshot: PlayerSnapshot = { index: 0, playing: false, volume: 0.7 }
const listeners = new Set<(s: PlayerSnapshot) => void>()

let scheduled: OscillatorNode[] = []
let loopTimer: ReturnType<typeof setTimeout> | null = null
/** ctx.currentTime when the current loop segment began */
let loopStart = 0
/** seconds into the loop that the segment began at */
let loopOffset = 0
let loopLength = 0
/** progress to show while paused, 0–1 */
let pausedProgress = 0

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  try {
    ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
  } catch {
    return null
  }

  musicBus = ctx.createGain()
  musicBus.gain.value = snapshot.volume
  analyser = ctx.createAnalyser()
  analyser.fftSize = 128
  analyser.smoothingTimeConstant = 0.78
  musicBus.connect(analyser)
  musicBus.connect(ctx.destination)

  sfxBus = ctx.createGain()
  sfxBus.gain.value = 1
  sfxBus.connect(ctx.destination)

  return ctx
}

export function getAudioContext() {
  return ensure()
}

export function getSfxBus() {
  ensure()
  return sfxBus
}

export function getAnalyser() {
  ensure()
  return analyser
}

export function getSnapshot() {
  return snapshot
}

export function subscribe(fn: (s: PlayerSnapshot) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function emit() {
  for (const fn of listeners) fn(snapshot)
}

/** 0–1 through the current loop. */
export function getProgress() {
  if (!ctx || !snapshot.playing || loopLength <= 0) return pausedProgress
  const pos = (loopOffset + (ctx.currentTime - loopStart)) % loopLength
  return pos / loopLength
}

function clearSchedule() {
  for (const osc of scheduled) {
    try {
      osc.stop()
    } catch {
      /* already stopped */
    }
  }
  scheduled = []
  if (loopTimer) {
    clearTimeout(loopTimer)
    loopTimer = null
  }
}

function schedule(from: number) {
  const ac = ensure()
  if (!ac || !musicBus) return

  const melody = tracks[snapshot.index].melody
  loopLength = melodyLength(melody)
  loopStart = ac.currentTime
  loopOffset = from

  for (const note of notesFrom(melody, from)) {
    const when = ac.currentTime + note.offset
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'square'
    osc.frequency.value = note.freq
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(0.08, when + 0.01)
    gain.gain.linearRampToValueAtTime(0.06, when + note.duration * 0.7)
    gain.gain.linearRampToValueAtTime(0, when + note.duration)
    osc.connect(gain)
    gain.connect(musicBus)
    osc.start(when)
    osc.stop(when + note.duration + 0.02)
    scheduled.push(osc)
  }

  loopTimer = setTimeout(
    () => {
      if (!snapshot.playing) return
      clearSchedule()
      schedule(0)
    },
    Math.max(0, (loopLength - from) * 1000),
  )
}

export function play() {
  const ac = ensure()
  if (!ac) return
  if (ac.state === 'suspended') void ac.resume()
  if (snapshot.playing) return
  if (loopLength > 0) loopOffset = pausedProgress * loopLength
  snapshot = { ...snapshot, playing: true }
  emit()
  schedule(loopOffset)
}

export function pause() {
  if (!snapshot.playing) return
  pausedProgress = getProgress()
  snapshot = { ...snapshot, playing: false }
  emit()
  clearSchedule()
}

export function toggle() {
  if (snapshot.playing) pause()
  else play()
}

function jump(dir: 1 | -1) {
  const wasPlaying = snapshot.playing
  clearSchedule()
  snapshot = {
    ...snapshot,
    index: (snapshot.index + dir + tracks.length) % tracks.length,
  }
  loopOffset = 0
  pausedProgress = 0
  emit()
  if (wasPlaying) schedule(0)
}

export function next() {
  jump(1)
}

export function prev() {
  jump(-1)
}

/** Seek to a fraction of the loop. */
export function seek(fraction: number) {
  const f = Math.max(0, Math.min(1, fraction))
  pausedProgress = f
  if (!snapshot.playing || loopLength <= 0) {
    emit()
    return
  }
  clearSchedule()
  schedule(f * loopLength)
}

export function setVolume(value: number) {
  const volume = Math.max(0, Math.min(1, value))
  snapshot = { ...snapshot, volume }
  if (musicBus && ctx) {
    musicBus.gain.setTargetAtTime(volume, ctx.currentTime, 0.02)
  }
  emit()
}
