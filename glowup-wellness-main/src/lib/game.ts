import { ITEMS, itemsFor, type AvatarConfig, type Body, type Category, type Item, type Unlock } from '../data/items'
import type { MeditateAnswers, MoveAnswers, UnwindLength } from '../data/recommend'

export interface Entry {
  id: string
  activityId: string
  cat: Category
  xp: number
  minutes: number
  day: string
  ts: number
  title?: string
}

export interface GameState {
  onboarded: boolean
  name: string
  avatar: AvatarConfig
  log: Entry[]
  seen: string[]
  dayOffset: number
  demoSpeed: boolean
  sound: boolean
  unwindSwap: string | null
  lastMove?: MoveAnswers
  lastMeditate?: MeditateAnswers
  lastUnwindLength?: UnwindLength
}

export const DAILY_GOAL = 50

export function dayKey(offset = 0, base = new Date()): string {
  const d = new Date(base)
  d.setDate(d.getDate() + offset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(delta, new Date(y, m - 1, d))
}

export function levelStart(level: number): number {
  return 50 * level * (level - 1)
}

export function levelFor(xp: number): number {
  let l = 1
  while (levelStart(l + 1) <= xp) l++
  return l
}

function streakFrom(days: Set<string>, today: string): number {
  let cursor = days.has(today) ? today : shiftDay(today, -1)
  let n = 0
  while (days.has(cursor)) {
    n++
    cursor = shiftDay(cursor, -1)
  }
  return n
}

function bestStreak(days: Set<string>): number {
  const sorted = [...days].sort()
  let best = 0
  let run = 0
  let prev = ''
  for (const d of sorted) {
    run = prev && shiftDay(prev, 1) === d ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return best
}

export interface Stats {
  today: string
  xp: number
  level: number
  levelProgress: number
  levelNeed: number
  catXp: Record<Category, number>
  catCount: Record<Category, number>
  minutes: number
  count: number
  streak: number
  best: number
  unwindStreak: number
  bestUnwind: number
  todayXp: number
  doneToday: boolean
  unwindToday: boolean
  activeDays: Set<string>
}

export function computeStats(state: GameState): Stats {
  const today = dayKey(state.dayOffset)
  const catXp: Record<Category, number> = { move: 0, calm: 0, unwind: 0 }
  const catCount: Record<Category, number> = { move: 0, calm: 0, unwind: 0 }
  let xp = 0
  let minutes = 0
  let todayXp = 0
  const days = new Set<string>()
  const unwindDays = new Set<string>()
  for (const e of state.log) {
    xp += e.xp
    minutes += e.minutes
    catXp[e.cat] += e.xp
    catCount[e.cat]++
    days.add(e.day)
    if (e.cat === 'unwind') unwindDays.add(e.day)
    if (e.day === today) todayXp += e.xp
  }
  const level = levelFor(xp)
  const start = levelStart(level)
  // Unlocks are defined by "max streak ever reached" so items never get re-locked.
  const best = bestStreak(days)
  const bestUnwind = bestStreak(unwindDays)
  return {
    today,
    xp,
    level,
    levelProgress: xp - start,
    levelNeed: levelStart(level + 1) - start,
    catXp,
    catCount,
    minutes,
    count: state.log.length,
    streak: streakFrom(days, today),
    best,
    unwindStreak: streakFrom(unwindDays, today),
    bestUnwind,
    todayXp,
    doneToday: days.has(today),
    unwindToday: unwindDays.has(today),
    activeDays: days,
  }
}

export function unlockProgress(u: Unlock, s: Stats): { have: number; need: number } {
  switch (u.type) {
    case 'xp':
      return { have: s.xp, need: u.value }
    case 'level':
      return { have: s.xp, need: levelStart(u.value) }
    case 'streak':
      return { have: s.best, need: u.value }
    case 'unwindStreak':
      return { have: s.bestUnwind, need: u.value }
    case 'category':
      return { have: s.catXp[u.cat], need: u.value }
  }
}

export function isUnlocked(item: Item, s: Stats): boolean {
  if (!item.unlock) return true
  const p = unlockProgress(item.unlock, s)
  return p.have >= p.need
}

export function unlockedIds(s: Stats, body?: Body): string[] {
  return (body ? itemsFor(body) : ITEMS).filter((i) => isUnlocked(i, s)).map((i) => i.id)
}

/** The locked item the user is closest to (by fraction complete). */
export function nextReward(s: Stats, body: Body): { item: Item; have: number; need: number } | null {
  let best: { item: Item; have: number; need: number; frac: number } | null = null
  for (const item of itemsFor(body)) {
    if (!item.unlock || isUnlocked(item, s)) continue
    const p = unlockProgress(item.unlock, s)
    const frac = p.have / p.need
    if (!best || frac > best.frac) best = { item, ...p, frac }
  }
  return best
}

export const STREAK_MILESTONES = [3, 7, 14, 30]
