// Файлгүй, Web Audio API-аар шууд үүсгэсэн дуу чимээ

let ctx = null
let enabled = true

function ac() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

export function setSoundEnabled(on) {
  enabled = on
}

function tone({ freq, start = 0, dur = 0.12, type = 'sine', gain = 0.08, slideTo = null }) {
  if (!enabled) return
  const a = ac()
  if (!a) return
  const t0 = a.currentTime + start
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(a.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export const sfx = {
  correct() {
    tone({ freq: 660, dur: 0.09, type: 'triangle', gain: 0.07 })
    tone({ freq: 880, start: 0.07, dur: 0.14, type: 'triangle', gain: 0.07 })
  },
  wrong() {
    tone({ freq: 220, dur: 0.18, type: 'sawtooth', gain: 0.05, slideTo: 130 })
  },
  tap() {
    tone({ freq: 520, dur: 0.045, type: 'sine', gain: 0.035 })
  },
  complete() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => tone({ freq: f, start: i * 0.09, dur: 0.22, type: 'triangle', gain: 0.075 }))
  },
  levelUp() {
    const notes = [392, 523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => tone({ freq: f, start: i * 0.07, dur: 0.3, type: 'sine', gain: 0.07 }))
  },
  heartLost() {
    tone({ freq: 380, dur: 0.22, type: 'sine', gain: 0.06, slideTo: 180 })
  },
  engine() {
    tone({ freq: 90, dur: 0.5, type: 'sawtooth', gain: 0.03, slideTo: 150 })
  },
  unlock() {
    tone({ freq: 700, dur: 0.1, type: 'square', gain: 0.045 })
    tone({ freq: 1050, start: 0.1, dur: 0.2, type: 'square', gain: 0.045 })
  },
}
