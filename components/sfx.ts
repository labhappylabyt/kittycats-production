'use client'

// Lightweight tactile sound engine built entirely with the Web Audio API.
// Sound is opt-in through the UI toggle and never relies on downloaded media.
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  try {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  } catch {
    return null
  }
  return ctx
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) {
  const audioContext = getCtx()
  if (!audioContext) return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + start)
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + start + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + start + duration)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(audioContext.currentTime + start)
  oscillator.stop(audioContext.currentTime + start + duration + 0.02)
}

export async function resumeAudio() {
  const audioContext = getCtx()
  if (audioContext?.state === 'suspended') {
    try { await audioContext.resume() } catch { /* browser policy rejection */ }
  }
}

export function playMeow() {
  tone(880, 0, 0.16, 'triangle', 0.09)
  tone(660, 0.06, 0.18, 'triangle', 0.075)
  tone(440, 0.12, 0.14, 'sine', 0.05)
}

export function playClick() {
  tone(1280, 0, 0.045, 'sine', 0.045)
  tone(860, 0.028, 0.055, 'sine', 0.034)
}

export function playAdopt() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => tone(frequency, index * 0.085, 0.18, 'triangle', 0.075))
}

export function playTick() {
  tone(1500, 0, 0.035, 'sine', 0.025)
}

export function playPop() {
  tone(620, 0, 0.055, 'sine', 0.055)
  tone(990, 0.035, 0.07, 'triangle', 0.042)
}

// A faint two-tone shimmer for major hover transitions.
export function playHoverHum() {
  tone(220, 0, 0.16, 'sine', 0.014)
  tone(330, 0.04, 0.19, 'sine', 0.011)
}

export function playChime() {
  tone(659.25, 0, 0.12, 'triangle', 0.06)
  tone(880, 0.08, 0.12, 'triangle', 0.06)
  tone(1318.51, 0.16, 0.16, 'triangle', 0.06)
}

// Pickup: quick two-step blip that lands as the lift starts.
export function playPickup() {
  tone(520, 0, 0.035, 'sine', 0.035)
  tone(780, 0.02, 0.05, 'sine', 0.03)
}

// Merge payoff: low-to-high glide that lands exactly as the merge settles.
export function playMerge() {
  const audioContext = getCtx()
  if (!audioContext) return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(220, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.16)
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.24)
}

// Repeat-combine: a warm little pop chime.
export function playDiscoverRepeat() {
  tone(784, 0, 0.07, 'triangle', 0.05)
  tone(1046.5, 0.06, 0.09, 'triangle', 0.045)
}

// First-time discovery: a rising four-note fanfare, bigger than a repeat.
export function playDiscoverFirst() {
  const notes: Array<[number, number, number]> = [
    [523.25, 0, 0.11],
    [659.25, 0.09, 0.11],
    [783.99, 0.18, 0.12],
    [1046.5, 0.27, 0.2],
  ]
  notes.forEach(([frequency, start, duration]) => tone(frequency, start, duration, 'triangle', 0.06))
  tone(2093, 0.27, 0.24, 'sine', 0.03)
}

// Mythic-only chime: five-note arpeggio with a shimmering octave pair.
export function playMythic() {
  const notes: Array<[number, number]> = [
    [523.25, 0],
    [659.25, 0.09],
    [783.99, 0.18],
    [1046.5, 0.27],
    [1318.51, 0.36],
  ]
  notes.forEach(([frequency, start]) => tone(frequency, start, 0.24, 'triangle', 0.065))
  tone(2637.02, 0.36, 0.4, 'sine', 0.028)
  tone(2637.02 * 0.75, 0.45, 0.34, 'sine', 0.02)
}

export function playPurr() {
  const audioContext = getCtx()
  if (!audioContext) return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const lfo = audioContext.createOscillator()
  const lfoGain = audioContext.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = 64
  lfo.type = 'sine'
  lfo.frequency.value = 18
  lfoGain.gain.value = 5
  lfo.connect(lfoGain)
  lfoGain.connect(oscillator.frequency)
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.028, audioContext.currentTime + 0.06)
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.55)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start()
  lfo.start()
  oscillator.stop(audioContext.currentTime + 0.6)
  lfo.stop(audioContext.currentTime + 0.6)
}
