'use client'

// Lightweight chiptune SFX engine built on the Web Audio API.
// All sounds are synthesized — no audio files required.

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  try {
    ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
  } catch {
    return null
  }
  return ctx
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'square',
  vol = 0.12,
) {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + start)
  gain.gain.setValueAtTime(0, ac.currentTime + start)
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + dur + 0.02)
}

export async function resumeAudio() {
  const ac = getCtx()
  if (!ac) return
  if (ac.state === 'suspended') {
    try {
      await ac.resume()
    } catch {
      /* noop */
    }
  }
}

// Soft chiptune "meow": two quick descending formants.
export function playMeow() {
  const ac = getCtx()
  if (!ac) return
  resumeAudio()
  tone(880, 0, 0.16, 'triangle', 0.14)
  tone(660, 0.06, 0.18, 'triangle', 0.12)
  tone(440, 0.12, 0.14, 'sine', 0.08)
}

// Tiny pixel click for control taps.
export function playClick() {
  const ac = getCtx()
  if (!ac) return
  resumeAudio()
  tone(1200, 0, 0.05, 'square', 0.08)
  tone(800, 0.03, 0.05, 'square', 0.06)
}

// Happy adoption jingle.
export function playAdopt() {
  const ac = getCtx()
  if (!ac) return
  resumeAudio()
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((f, i) => tone(f, i * 0.09, 0.18, 'triangle', 0.12))
}
