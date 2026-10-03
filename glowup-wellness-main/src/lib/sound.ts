let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(on: boolean) {
  enabled = on
}

function ac(): AudioContext | null {
  if (!enabled) return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  const c = ac()
  if (!c) return
  const t = c.currentTime + start
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.08),
  step: () => tone(880, 0, 0.12, 'sine', 0.1),
  complete: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.14)),
  levelUp: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.08, 0.35, 'square', 0.06)),
  unlock: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.4, 'sine', 0.12)),
  breathIn: () => tone(330, 0, 0.6, 'sine', 0.05),
  breathOut: () => tone(247, 0, 0.8, 'sine', 0.05),
  chime: () => tone(523, 0, 2.2, 'sine', 0.06),
}

export interface Ambient {
  stop: () => void
}

export function startAmbient(kind: 'rain' | 'waves'): Ambient | null {
  const c = ac()
  if (!c) return null
  const len = c.sampleRate * 4
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = kind === 'rain' ? white * 0.5 + last * 2 : last * 3.5
  }
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = true
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = kind === 'rain' ? 1400 : 600
  const gain = c.createGain()
  gain.gain.value = 0
  gain.gain.linearRampToValueAtTime(kind === 'rain' ? 0.12 : 0.25, c.currentTime + 3)
  src.connect(filter).connect(gain).connect(c.destination)

  let lfo: OscillatorNode | null = null
  if (kind === 'waves') {
    lfo = c.createOscillator()
    lfo.frequency.value = 0.09
    const lfoGain = c.createGain()
    lfoGain.gain.value = 0.18
    lfo.connect(lfoGain).connect(gain.gain)
    lfo.start()
  }
  src.start()
  return {
    stop: () => {
      const t = c.currentTime
      gain.gain.cancelScheduledValues(t)
      gain.gain.setValueAtTime(gain.gain.value, t)
      gain.gain.linearRampToValueAtTime(0, t + 1)
      src.stop(t + 1.1)
      lfo?.stop(t + 1.1)
    },
  }
}
