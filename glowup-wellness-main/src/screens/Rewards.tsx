import { useEffect, useMemo, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Button, Confetti, Flame, Moon, Pip } from '../components/ui'
import type { Activity } from '../data/activities'
import type { AvatarConfig, Item } from '../data/items'
import type { Stats } from '../lib/game'
import { sfx } from '../lib/sound'

export interface Result {
  activity: Activity
  minutes: number
  xp: number
  before: Stats
  after: Stats
  newItems: Item[]
}

type Panel = { kind: 'complete' } | { kind: 'streak' } | { kind: 'unwindStreak' } | { kind: 'level' } | { kind: 'unlock'; item: Item } | { kind: 'goodnight' }

interface Props {
  result: Result
  avatar: AvatarConfig
  onEquip: (item: Item) => void
  onDone: () => void
}

export function Rewards({ result, avatar, onEquip, onDone }: Props) {
  const { activity, xp, minutes, before, after, newItems } = result
  const night = activity.category === 'unwind'
  const panels = useMemo<Panel[]>(() => {
    const p: Panel[] = [{ kind: 'complete' }]
    if (after.streak > before.streak) p.push({ kind: 'streak' })
    if (night && after.unwindStreak > before.unwindStreak) p.push({ kind: 'unwindStreak' })
    if (after.level > before.level) p.push({ kind: 'level' })
    newItems.forEach((item) => p.push({ kind: 'unlock', item }))
    if (night) p.push({ kind: 'goodnight' })
    return p
  }, [after, before, newItems, night])
  const [i, setI] = useState(0)
  const [worn, setWorn] = useState<AvatarConfig>(avatar)
  const panel = panels[i]

  useEffect(() => {
    if (panel.kind === 'complete') (night ? sfx.chime : sfx.complete)()
    if (panel.kind === 'level') sfx.levelUp()
    if (panel.kind === 'unlock') sfx.unlock()
    if (panel.kind === 'streak' || panel.kind === 'unwindStreak') sfx.complete()
  }, [panel, night])

  const next = () => (i < panels.length - 1 ? setI(i + 1) : onDone())
  const variant = night ? 'purple' : 'green'

  return (
    <div className={`screen rewards ${night ? 'rewards-night' : ''}`}>
      {!night && (panel.kind === 'complete' || panel.kind === 'level' || panel.kind === 'unlock') && <Confetti key={i} />}

      {panel.kind === 'complete' && (
        <div className="rw-panel">
          <div className="rw-avatar">
            <Avatar config={night ? { ...worn, background: 'night' } : worn} pose={night ? 'sleep' : 'cheer'} anim={night ? 'breathe' : 'jump'} />
          </div>
          <h1 className="rw-title">{night ? 'Wind-down complete' : 'Quest complete!'}</h1>
          <p className="rw-sub">{activity.title}</p>
          <div className="rw-stats">
            <div className="rw-stat gold">
              <small>XP earned</small>
              <b>+{xp}</b>
            </div>
            <div className="rw-stat blue">
              <small>Time</small>
              <b>{minutes} min</b>
            </div>
            <div className="rw-stat orange">
              <small>Streak</small>
              <b>
                {after.streak} day{after.streak === 1 ? '' : 's'}
              </b>
            </div>
          </div>
        </div>
      )}

      {panel.kind === 'streak' && (
        <div className="rw-panel">
          <div className="big-flame">
            <Flame size={140} />
            <span>{after.streak}</span>
          </div>
          <h1 className="rw-title orange-text">{after.streak} day streak!</h1>
          <p className="rw-sub">{after.streak === 1 ? 'Day one. Every glow-up starts somewhere.' : 'You showed up again. That\'s the whole secret.'}</p>
          <WeekDots stats={after} />
        </div>
      )}

      {panel.kind === 'unwindStreak' && (
        <div className="rw-panel">
          <div className="big-flame">
            <Moon size={130} />
            <span className="moon-num">{after.unwindStreak}</span>
          </div>
          <h1 className="rw-title">{after.unwindStreak}-night wind-down streak</h1>
          <p className="rw-sub">Your future self says thanks for the sleep.</p>
        </div>
      )}

      {panel.kind === 'level' && (
        <div className="rw-panel">
          <div className="level-burst">
            <span>{after.level}</span>
          </div>
          <h1 className="rw-title gold-text">Level up!</h1>
          <p className="rw-sub">You're now level {after.level}. Your character is glowing ✨</p>
        </div>
      )}

      {panel.kind === 'unlock' && (
        <div className="rw-panel">
          <div className="rw-tag">New item unlocked</div>
          <div className="rw-avatar unlock-glow">
            <Avatar config={{ ...worn, [panel.item.slot]: panel.item.id }} pose="cheer" anim="bounce" />
          </div>
          <h1 className="rw-title">{panel.item.name}</h1>
          <p className="rw-sub">Earned by taking care of yourself. Wear it with pride.</p>
        </div>
      )}

      {panel.kind === 'goodnight' && (
        <div className="rw-panel">
          <Pip mood="sleepy" size={130} />
          <h1 className="rw-title">Goodnight</h1>
          <p className="rw-sub">That's all for tonight. No next episode, no "you might also like". Phone down, eyes closed.</p>
        </div>
      )}

      <div className="rw-actions">
        {panel.kind === 'unlock' ? (
          <>
            <Button
              block
              variant="gold"
              onClick={() => {
                onEquip(panel.item)
                setWorn((w) => ({ ...w, [panel.item.slot]: panel.item.id }))
                next()
              }}
            >
              Wear it now
            </Button>
            <button className="link-btn" onClick={next}>
              Maybe later
            </button>
          </>
        ) : (
          <Button block variant={variant} onClick={next}>
            {panel.kind === 'goodnight' ? 'Sleep well' : 'Continue'}
          </Button>
        )}
      </div>
    </div>
  )
}

function WeekDots({ stats }: { stats: Stats }) {
  const days = Array.from({ length: 7 }, (_, k) => {
    const d = new Date(stats.today + 'T12:00')
    d.setDate(d.getDate() - 6 + k)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return { key, label: d.toLocaleDateString(undefined, { weekday: 'narrow' }) }
  })
  return (
    <div className="week-dots">
      {days.map((d) => (
        <div key={d.key} className={`wd ${stats.activeDays.has(d.key) ? 'on' : ''}`}>
          <small>{d.label}</small>
          <span>{stats.activeDays.has(d.key) ? '✓' : ''}</span>
        </div>
      ))}
    </div>
  )
}
