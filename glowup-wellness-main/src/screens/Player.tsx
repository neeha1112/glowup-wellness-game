import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Bar, Button, Icon, Pip, Sheet } from '../components/ui'
import { CATEGORY_INFO, STORY, type Activity, type Step } from '../data/activities'
import type { AvatarConfig } from '../data/items'
import { sfx, startAmbient } from '../lib/sound'

interface Props {
  activity: Activity
  minutes: number
  part?: { n: number; of: number; next?: string }
  avatar: AvatarConfig
  demoSpeed: boolean
  soundOn: boolean
  onToggleSpeed: () => void
  onExit: () => void
  onComplete: () => void
}

function useClock(total: number, speed: number, paused: boolean) {
  const [elapsed, setElapsed] = useState(0)
  const last = useRef<number | null>(null)
  useEffect(() => {
    if (paused) {
      last.current = null
      return
    }
    let raf = 0
    const tick = (t: number) => {
      if (last.current != null) {
        const dt = ((t - last.current) / 1000) * speed
        setElapsed((e) => Math.min(total, e + dt))
      }
      last.current = t
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paused, speed, total])
  return [elapsed, setElapsed] as const
}

const fmt = (s: number) => {
  const r = Math.max(0, Math.ceil(s))
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`
}

export function Player({ activity, minutes, part, avatar, demoSpeed, soundOn, onToggleSpeed, onExit, onComplete }: Props) {
  const total = activity.kind === 'journal' ? Infinity : minutes * 60
  const [paused, setPaused] = useState(false)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const speed = demoSpeed ? 10 : 1
  const [elapsed, setElapsed] = useClock(total, speed, paused || confirmQuit)
  const done = useRef(false)
  const dark = activity.category === 'unwind'
  const info = CATEGORY_INFO[activity.category]

  useEffect(() => {
    if (!done.current && elapsed >= total) {
      done.current = true
      onComplete()
    }
  }, [elapsed, total, onComplete])

  const steps: (Step & { start: number; end: number })[] = useMemo(() => {
    const src = activity.steps ?? []
    const sum = src.reduce((a, s) => a + s.seconds, 0) || 1
    let acc = 0
    return src.map((s) => {
      const len = (s.seconds / sum) * total
      const out = { ...s, start: acc, end: acc + len }
      acc += len
      return out
    })
  }, [activity, total])

  const stepIdx = steps.findIndex((s) => elapsed < s.end)
  const step = steps[stepIdx === -1 ? steps.length - 1 : stepIdx]
  const prevStep = useRef(-1)
  useEffect(() => {
    if (activity.kind === 'steps' && stepIdx !== prevStep.current) {
      if (prevStep.current !== -1) (dark ? sfx.chime : sfx.step)()
      prevStep.current = stepIdx
    }
  }, [stepIdx, activity.kind, dark])

  const quit = () => (elapsed > 5 || activity.kind === 'journal' || (part && part.n > 1) ? setConfirmQuit(true) : onExit())
  const progress = activity.kind === 'journal' ? 0 : elapsed / total

  return (
    <div className={`screen player player-${activity.category} ${dark ? 'player-dark' : ''}`} style={{ ['--c' as string]: info.color, ['--d' as string]: info.dark, ['--l' as string]: info.light }}>
      <header className="player-header">
        <button className="icon-btn" onClick={quit} aria-label="Quit">
          <Icon name="close" />
        </button>
        <div className="player-bar">
          <Bar value={progress} max={1} color={info.color} height={16} />
        </div>
        {activity.kind !== 'journal' && (
          <button className={`speed ${demoSpeed ? 'on' : ''}`} onClick={onToggleSpeed} title="Demo speed: run timers 10× faster">
            {demoSpeed ? '10×' : '1×'}
          </button>
        )}
      </header>

      <div className="player-title">
        <small className="eyebrow">{part ? `${info.name} · part ${part.n} of ${part.of}` : info.name}</small>
        {activity.title}
        {part && (
          <div className="part-dots">
            {Array.from({ length: part.of }, (_, k) => (
              <i key={k} className={k < part.n ? 'on' : ''} />
            ))}
          </div>
        )}
      </div>

      {activity.kind === 'steps' && step && (
        <StepsView avatar={avatar} step={step} stepIdx={Math.max(0, stepIdx)} count={steps.length} remaining={step.end - elapsed} stepLen={step.end - step.start} dark={dark} />
      )}
      {activity.kind === 'breath' && activity.breath && (
        <BreathView avatar={avatar} pattern={activity.breath} elapsed={elapsed} dark={dark} soundOn={soundOn} />
      )}
      {activity.kind === 'story' && <StoryView elapsed={elapsed} total={total} />}
      {activity.kind === 'sound' && activity.sound && <SoundView kind={activity.sound} elapsed={elapsed} soundOn={soundOn} paused={paused} />}
      {activity.kind === 'journal' && <JournalView onDone={onComplete} />}

      {activity.kind !== 'journal' && (
        <footer className="player-footer">
          <div className="time-left">
            {fmt(total - elapsed)} left{part?.next ? ` · then ${part.next}` : ''}
          </div>
          <div className="player-controls">
            <Button variant="white" onClick={() => setPaused((p) => !p)}>
              {paused ? 'Resume' : 'Pause'}
            </Button>
            {activity.kind === 'steps' && step && (
              <Button variant="white" onClick={() => setElapsed(Math.min(total, step.end + 0.01))}>
                Skip step
              </Button>
            )}
          </div>
        </footer>
      )}

      {confirmQuit && (
        <Sheet onClose={() => setConfirmQuit(false)} dark={dark}>
          <div className="quit-sheet">
            <Pip mood={dark ? 'sleepy' : 'happy'} size={80} />
            <h3>Wait, you're doing great!</h3>
            <p>If you leave now you won't earn XP for this one.</p>
            <Button block variant={dark ? 'purple' : 'green'} onClick={() => setConfirmQuit(false)}>
              Keep going
            </Button>
            <button className="link-btn danger" onClick={onExit}>
              End session
            </button>
          </div>
        </Sheet>
      )}
    </div>
  )
}

function StepsView({ avatar, step, stepIdx, count, remaining, stepLen, dark }: { avatar: AvatarConfig; step: Step; stepIdx: number; count: number; remaining: number; stepLen: number; dark: boolean }) {
  const pct = 1 - remaining / stepLen
  return (
    <div className="steps-view">
      <div className="stage">
        <Avatar config={dark ? { ...avatar, background: 'night' } : avatar} pose={step.pose} anim={step.anim} />
        <div className="step-timer" style={{ ['--p' as string]: pct }}>
          <span>{Math.ceil(remaining)}</span>
        </div>
      </div>
      <div className="step-count">
        Step {stepIdx + 1} of {count}
      </div>
      <p key={stepIdx} className="step-text">
        {step.text}
      </p>
    </div>
  )
}

function BreathView({ avatar, pattern, elapsed, dark, soundOn }: { avatar: AvatarConfig; pattern: NonNullable<Activity['breath']>; elapsed: number; dark: boolean; soundOn: boolean }) {
  const { inhale, hold, exhale, hold2 } = pattern
  const cycle = inhale + hold + exhale + hold2
  const t = elapsed % cycle
  let phase: string
  let scale: number
  let left: number
  if (t < inhale) {
    phase = 'Breathe in'
    scale = 0.55 + 0.45 * (t / inhale)
    left = inhale - t
  } else if (t < inhale + hold) {
    phase = 'Hold'
    scale = 1
    left = inhale + hold - t
  } else if (t < inhale + hold + exhale) {
    phase = 'Breathe out'
    scale = 1 - 0.45 * ((t - inhale - hold) / exhale)
    left = inhale + hold + exhale - t
  } else {
    phase = 'Hold'
    scale = 0.55
    left = cycle - t
  }
  const prev = useRef('')
  useEffect(() => {
    if (!soundOn || phase === prev.current) return
    prev.current = phase
    if (phase === 'Breathe in') sfx.breathIn()
    if (phase === 'Breathe out') sfx.breathOut()
  }, [phase, soundOn])

  return (
    <div className="breath-view">
      <div className="breath-stage">
        <div className="breath-ring" style={{ transform: `scale(${scale})` }} />
        <div className="breath-ring inner" style={{ transform: `scale(${scale * 0.8})` }} />
        <div className="breath-avatar">
          <Avatar config={avatar} pose={dark ? 'sleep' : 'sit'} anim="still" showBg={false} />
        </div>
      </div>
      <div className="breath-phase">{phase}</div>
      <div className="breath-count">{Math.ceil(left)}</div>
      <div className="breath-pattern">
        {inhale}-{hold}-{exhale}
        {hold2 ? `-${hold2}` : ''} · cycle {Math.floor(elapsed / cycle) + 1}
      </div>
    </div>
  )
}

function StoryView({ elapsed, total }: { elapsed: number; total: number }) {
  const per = total / STORY.length
  const shown = Math.min(STORY.length, Math.floor(elapsed / per) + 1)
  const bottom = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [shown])
  return (
    <div className="story-view">
      {STORY.slice(0, shown).map((line, i) => (
        <p key={i} className={i === shown - 1 ? 'current' : ''}>
          {line}
        </p>
      ))}
      <div ref={bottom} />
    </div>
  )
}

function SoundView({ kind, elapsed, soundOn, paused }: { kind: 'rain' | 'waves'; elapsed: number; soundOn: boolean; paused: boolean }) {
  useEffect(() => {
    if (!soundOn || paused) return
    const amb = startAmbient(kind)
    return () => amb?.stop()
  }, [kind, soundOn, paused])
  const cycle = 10
  const t = elapsed % cycle
  const inhaling = t < 4
  const scale = inhaling ? 0.6 + 0.4 * (t / 4) : 1 - 0.4 * ((t - 4) / 6)
  return (
    <div className={`sound-view sound-${kind}`}>
      {kind === 'rain' && (
        <div className="rain" aria-hidden>
          {Array.from({ length: 40 }, (_, i) => (
            <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.13) % 2}s`, animationDuration: `${1.6 + (i % 5) * 0.2}s` }} />
          ))}
        </div>
      )}
      {kind === 'waves' && (
        <svg className="waves" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden>
          <path d="M0 60 Q50 40 100 60 T200 60 T300 60 T400 60 V120 H0 Z" fill="#3B3F8F" />
          <path d="M0 80 Q50 60 100 80 T200 80 T300 80 T400 80 V120 H0 Z" fill="#4A4FA8" />
        </svg>
      )}
      <div className="orb" style={{ transform: `scale(${scale})` }} />
      <div className="sound-label">{inhaling ? 'breathe in…' : 'and slowly out…'}</div>
      {!soundOn && <div className="tiny-note">Sound is off in settings. Just follow the light.</div>}
    </div>
  )
}

function JournalView({ onDone }: { onDone: () => void }) {
  const [vals, setVals] = useState(['', '', ''])
  const prompts = ['Something that made you smile', 'Something you did well', 'Something you\'re looking forward to']
  const ready = vals.every((v) => v.trim().length > 1)
  return (
    <div className="journal-view">
      <p className="journal-intro">Tiny is fine. "Good coffee" counts.</p>
      {prompts.map((p, i) => (
        <label key={i} className="journal-field">
          <span>
            {i + 1}. {p}
          </span>
          <textarea
            rows={2}
            value={vals[i]}
            onChange={(e) => setVals((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder="…"
          />
        </label>
      ))}
      <Button block variant="purple" disabled={!ready} onClick={onDone}>
        Save & finish
      </Button>
      <p className="tiny-note">Your words stay on this device.</p>
    </div>
  )
}
