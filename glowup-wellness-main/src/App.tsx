import { useCallback, useEffect, useState } from 'react'
import { xpFor, type Activity } from './data/activities'
import { itemsFor, type Item } from './data/items'
import type { UnwindPlan } from './data/recommend'
import { Icon } from './components/ui'
import { computeStats, dayKey, isUnlocked, unlockedIds } from './lib/game'
import { setSoundEnabled } from './lib/sound'
import { useGame } from './lib/store'
import { MeditateFlow, MoveFlow } from './screens/Category'
import { Closet } from './screens/Closet'
import { Home } from './screens/Home'
import { Me } from './screens/Me'
import { Onboarding } from './screens/Onboarding'
import { Player } from './screens/Player'
import { Progress } from './screens/Progress'
import { Rewards, type Result } from './screens/Rewards'
import { UnwindScreen } from './screens/Unwind'

type Tab = 'home' | 'closet' | 'progress' | 'me'
type Flow = { type: 'move' } | { type: 'meditate' } | { type: 'unwind' }
type Overlay =
  | Flow
  | { type: 'player'; activity: Activity; minutes: number; from: Flow | null }
  | { type: 'sequence'; plan: UnwindPlan; idx: number; from: Flow | null }
  | { type: 'rewards'; result: Result; from: Flow | null }
  | null

const TABS: { id: Tab; label: string; icon: 'home' | 'closet' | 'chart' | 'user' }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'closet', label: 'Closet', icon: 'closet' },
  { id: 'progress', label: 'Progress', icon: 'chart' },
  { id: 'me', label: 'Me', icon: 'user' },
]

const isFlow = (o: Overlay): o is Flow => !!o && (o.type === 'move' || o.type === 'meditate' || o.type === 'unwind')

export default function App() {
  const game = useGame()
  const { state, stats, update } = game
  const [tab, setTab] = useState<Tab>('home')
  const [overlay, setOverlay] = useState<Overlay>(null)

  useEffect(() => {
    setSoundEnabled(state.sound)
  }, [state.sound])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab, overlay])

  const unseen = itemsFor(state.avatar.body).filter((i) => i.unlock && isUnlocked(i, stats) && !state.seen.includes(i.id)).length

  const switchTab = (t: Tab) => {
    if (tab === 'closet' && t !== 'closet') update((s) => ({ seen: [...new Set([...s.seen, ...unlockedIds(computeStats(s), s.avatar.body)])] }))
    setTab(t)
  }

  const start = (activity: Activity, minutes: number) => setOverlay((cur) => ({ type: 'player', activity, minutes, from: isFlow(cur) ? cur : null }))
  const startSequence = (plan: UnwindPlan) => setOverlay({ type: 'sequence', plan, idx: 0, from: { type: 'unwind' } })

  const complete = useCallback(
    (activity: Activity, minutes: number, from: Flow | null) => {
      const xp = activity.xp ?? xpFor(activity.difficulty, minutes)
      const before = computeStats(state)
      const entry = { id: `${Date.now()}`, activityId: activity.id, cat: activity.category, xp, minutes, day: dayKey(state.dayOffset), ts: Date.now() }
      const after = computeStats({ ...state, log: [...state.log, entry] })
      const newItems = itemsFor(state.avatar.body).filter((i) => i.unlock && isUnlocked(i, after) && !state.seen.includes(i.id))
      game.logActivity(activity.id, activity.category, xp, minutes, activity.title)
      update((s) => ({ seen: [...new Set([...s.seen, ...newItems.map((i) => i.id)])] }))
      setOverlay({ type: 'rewards', result: { activity, minutes, xp, before, after, newItems }, from })
    },
    [state, game, update],
  )

  const equip = (item: Item) => update((s) => ({ avatar: { ...s.avatar, [item.slot]: item.id } }))

  if (!state.onboarded) return <div className="app"><Onboarding game={game} /></div>

  const player = (activity: Activity, minutes: number, onComplete: () => void, from: Flow | null, part?: { n: number; of: number; next?: string }) => (
    <div className="app">
      <Player
        key={`${activity.id}-${part?.n ?? 0}`}
        activity={activity}
        minutes={minutes}
        part={part}
        avatar={state.avatar}
        demoSpeed={state.demoSpeed}
        soundOn={state.sound}
        onToggleSpeed={() => update({ demoSpeed: !state.demoSpeed })}
        onExit={() => setOverlay(from)}
        onComplete={onComplete}
      />
    </div>
  )

  if (overlay?.type === 'player') {
    const { activity, minutes, from } = overlay
    return player(activity, minutes, () => complete(activity, minutes, from), from)
  }

  if (overlay?.type === 'sequence') {
    const { plan, idx, from } = overlay
    const seg = plan.segments[idx]
    const last = idx === plan.segments.length - 1
    return player(
      seg,
      seg.minutes,
      () => (last ? complete(plan.activity, plan.minutes, from) : setOverlay({ ...overlay, idx: idx + 1 })),
      from,
      { n: idx + 1, of: plan.segments.length, next: last ? undefined : plan.segments[idx + 1].title },
    )
  }

  if (overlay?.type === 'rewards') {
    return (
      <div className="app">
        <Rewards result={overlay.result} avatar={state.avatar} onEquip={equip} onDone={() => setOverlay(overlay.from?.type === 'unwind' ? overlay.from : null)} />
      </div>
    )
  }

  return (
    <div className={`app ${overlay?.type === 'unwind' ? 'app-dark' : ''}`}>
      {overlay?.type === 'move' ? (
        <MoveFlow game={game} onBack={() => setOverlay(null)} onStart={start} />
      ) : overlay?.type === 'meditate' ? (
        <MeditateFlow game={game} onBack={() => setOverlay(null)} onStart={start} />
      ) : overlay?.type === 'unwind' ? (
        <UnwindScreen game={game} onBack={() => setOverlay(null)} onStart={startSequence} />
      ) : (
        <>
          {tab === 'home' && (
            <Home
              game={game}
              onCategory={(c) => setOverlay({ type: c === 'calm' ? 'meditate' : c })}
              onCloset={() => switchTab('closet')}
            />
          )}
          {tab === 'closet' && <Closet game={game} />}
          {tab === 'progress' && <Progress game={game} />}
          {tab === 'me' && <Me game={game} />}
          <nav className="bottom-nav">
            {TABS.map((t) => (
              <button key={t.id} className={`nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => switchTab(t.id)}>
                <Icon name={t.icon} size={20} />
                <span className="nav-label">{t.label}</span>
                {t.id === 'closet' && unseen > 0 && <span className="nav-badge">{unseen}</span>}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  )
}
