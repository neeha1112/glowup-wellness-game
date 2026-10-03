import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Button, Icon, Moon, Pip } from '../components/ui'
import { UNWIND_XP_PER_MIN, type Activity } from '../data/activities'
import { UNWIND_INTENTS, buildWindDown, type UnwindIntent, type UnwindLength, type UnwindPlan } from '../data/recommend'
import { shiftDay } from '../lib/game'
import type { Game } from '../lib/store'

const fmtMin = (m: number) => (m < 1 ? `${Math.round(m * 60)} sec` : `${m % 1 ? m.toFixed(1) : m} min`)

interface Props {
  game: Game
  onBack: () => void
  onStart: (plan: UnwindPlan) => void
}

export function UnwindScreen({ game, onBack, onStart }: Props) {
  const { state, stats } = game
  const [intent, setIntent] = useState<UnwindIntent | null>(null)
  const length: UnwindLength = state.lastUnwindLength ?? 5
  const sleepyLook = { ...state.avatar, background: 'night' }
  const week = Array.from({ length: 7 }, (_, i) => shiftDay(stats.today, i - 6))
  const unwindDays = new Set(state.log.filter((e) => e.cat === 'unwind').map((e) => e.day))
  const dayName = (d: string) => new Date(d + 'T12:00').toLocaleDateString(undefined, { weekday: 'narrow' })
  const plan = intent ? buildWindDown(intent, length, stats.unwindStreak) : null

  return (
    <div className="screen unwind">
      <header className="unwind-header">
        <button className="icon-btn" onClick={() => (intent ? setIntent(null) : onBack())} aria-label="Back">
          <Icon name="back" />
        </button>
        <span>Wind down</span>
        <span className="unwind-streak">
          <Moon /> {stats.unwindStreak}
        </span>
      </header>

      <div className="unwind-stage">
        <Avatar config={sleepyLook} pose="sleep" anim="breathe" />
      </div>

      {stats.unwindToday ? (
        <div className="unwind-done">
          <h2>All done for tonight</h2>
          <p>That's it, no next video and nothing else to tap. Put your phone face-down and let your brain power down.</p>
          <div className="unwind-pip">
            <Pip mood="sleepy" size={80} />
            <span>"I'll guard your streak. Night night!"</span>
          </div>
        </div>
      ) : !plan ? (
        <>
          <div className="unwind-intro">
            <h2>What do you want to wind down with?</h2>
            <p>One tap. We'll put together a slow sequence for you.</p>
          </div>
          <div className="segmented unwind-len">
            {([5, 15] as UnwindLength[]).map((l) => (
              <button key={l} className={l === length ? 'active' : ''} onClick={() => game.update({ lastUnwindLength: l })}>
                {l} min
              </button>
            ))}
          </div>
          <div className="intent-list">
            {UNWIND_INTENTS.map((o) => (
              <button key={o.id} className="intent" onClick={() => setIntent(o.id)}>
                {o.label}
                <Icon name="arrow" size={18} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="unwind-card">
            <small className="eyebrow dark">{plan.activity.blurb}</small>
            <b>{plan.activity.title}</b>
            <ol className="sequence">
              {plan.segments.map((s: Activity, k) => (
                <li key={k}>
                  <span>{s.title}</span>
                  <small>{fmtMin(s.minutes)}</small>
                </li>
              ))}
            </ol>
            <small>
              +{plan.activity.xp} XP
              {plan.bonus > 0 ? ` (includes +${plan.bonus} for ${stats.unwindStreak} night${stats.unwindStreak === 1 ? '' : 's'} in a row)` : ' · come back tomorrow for a bonus'}
            </small>
          </div>
          <Button block variant="purple" onClick={() => onStart(plan)}>
            Begin wind-down
          </Button>
          <button className="link-btn" onClick={() => setIntent(null)}>
            Choose something else
          </button>
        </>
      )}

      <div className="unwind-week">
        {week.map((d) => (
          <div key={d} className={`uw-day ${d === stats.today ? 'today' : ''}`}>
            <Moon size={24} lit={unwindDays.has(d)} />
            <small>{dayName(d)}</small>
          </div>
        ))}
      </div>

      <ul className="unwind-rules">
        <li>Points come from showing up, not effort: {UNWIND_XP_PER_MIN} XP a minute, plus a bonus for every night in a row</li>
        <li>We'll never suggest "one more" after you finish</li>
        <li>A 3-night streak unlocks Bunny Slippers</li>
      </ul>
    </div>
  )
}
