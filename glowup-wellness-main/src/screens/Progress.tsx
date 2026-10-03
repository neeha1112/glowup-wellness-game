import { Avatar } from '../components/Avatar'
import { Bar, fmtMin } from '../components/ui'
import { ACTIVITY_BY_ID, CATEGORY_INFO } from '../data/activities'
import { describeUnlock, itemsFor, type Category } from '../data/items'
import { isUnlocked, shiftDay, unlockProgress } from '../lib/game'
import type { Game } from '../lib/store'
import { TopBar } from './Home'

export function Progress({ game }: { game: Game }) {
  const { state, stats } = game
  const pool = itemsFor(state.avatar.body)
  const unlockedCount = pool.filter((i) => isUnlocked(i, stats)).length
  const maxCat = Math.max(1, ...Object.values(stats.catXp))
  const days = Array.from({ length: 28 }, (_, i) => shiftDay(stats.today, i - 27))
  const xpByDay: Record<string, number> = {}
  for (const e of state.log) xpByDay[e.day] = (xpByDay[e.day] ?? 0) + e.xp
  const upcoming = pool
    .filter((i) => i.unlock && !isUnlocked(i, stats))
    .map((item) => ({ item, ...unlockProgress(item.unlock!, stats) }))
    .sort((a, b) => b.have / b.need - a.have / a.need)
    .slice(0, 4)
  const recent = [...state.log].reverse().filter((e) => e.activityId !== 'demo').slice(0, 6)

  const tiles: [string, string, string][] = [
    [stats.xp.toLocaleString(), 'Total XP', '#EDEB5E'],
    [`Lv ${stats.level}`, `${stats.levelNeed - stats.levelProgress} XP to next`, '#D4F06B'],
    [`${stats.streak}`, `Day streak · best ${stats.best}`, '#F2894A'],
    [`${stats.unwindStreak}`, 'Wind-down streak', '#C7B8FF'],
    [`${stats.count}`, 'Activities done', '#F2A3CB'],
    [fmtMin(stats.minutes), 'Time on wellness', '#A9C9F2'],
  ]

  return (
    <div className="screen progress">
      <TopBar game={game} />
      <h1 className="display">Progress</h1>

      <section className="stat-grid">
        {tiles.map(([v, l, c]) => (
          <div key={l} className="stat" style={{ background: c }}>
            <b>{v}</b>
            <small>{l}</small>
          </div>
        ))}
      </section>

      <h3 className="section-title">XP by category</h3>
      <section className="card cat-bars">
        {(['move', 'calm', 'unwind'] as Category[]).map((c) => (
          <div key={c} className="cat-bar">
            <span className="cat-bar-label">{CATEGORY_INFO[c].name}</span>
            <Bar value={stats.catXp[c]} max={maxCat} color={CATEGORY_INFO[c].color} height={14} />
            <span className="cat-bar-val">
              {stats.catXp[c]} XP · {stats.catCount[c]}×
            </span>
          </div>
        ))}
      </section>

      <h3 className="section-title">Last 4 weeks</h3>
      <section className="card calendar">
        {days.map((d) => {
          const xp = xpByDay[d] ?? 0
          const lvl = xp === 0 ? 0 : xp < 40 ? 1 : xp < 100 ? 2 : 3
          return (
            <div key={d} className={`cal-day l${lvl} ${d === stats.today ? 'today' : ''}`} title={`${d}: ${xp} XP`}>
              {new Date(d + 'T12:00').getDate()}
            </div>
          )
        })}
      </section>

      <h3 className="section-title">
        Closet · {unlockedCount}/{pool.length}
      </h3>
      <section className="card upcoming">
        {upcoming.length === 0 && <p>You've unlocked everything.</p>}
        {upcoming.map(({ item, have, need }) => (
          <div key={item.id} className="upcoming-row">
            <div className="upcoming-preview">
              <Avatar config={{ ...state.avatar, [item.slot]: item.id }} showBg={item.slot === 'background'} anim="still" />
            </div>
            <div className="upcoming-info">
              <b>{item.name}</b>
              <small>{describeUnlock(item.unlock!)}</small>
              <Bar value={have} max={need} height={6} color="#EDEB5E" />
            </div>
          </div>
        ))}
      </section>

      {recent.length > 0 && (
        <>
          <h3 className="section-title">Recent</h3>
          <section className="card recent">
            {recent.map((e) => {
              const a = ACTIVITY_BY_ID[e.activityId]
              return (
                <div key={e.id} className="recent-row">
                  <span className="recent-dot" style={{ background: CATEGORY_INFO[e.cat].color }} />
                  <span className="recent-title">
                    {e.title ?? a?.title ?? 'Activity'}
                    <small>
                      {e.day === stats.today ? 'Today' : e.day} · {e.minutes} min
                    </small>
                  </span>
                  <b className="recent-xp">+{e.xp}</b>
                </div>
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}
