import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_AVATAR, ITEMS } from '../data/items'
import type { Category } from '../data/items'
import { computeStats, dayKey, shiftDay, type Entry, type GameState } from './game'

const KEY = 'glowup-state-v1'

function initial(): GameState {
  return {
    onboarded: false,
    name: '',
    avatar: { ...DEFAULT_AVATAR },
    log: [],
    seen: ITEMS.filter((i) => !i.unlock).map((i) => i.id),
    dayOffset: 0,
    demoSpeed: false,
    sound: true,
    unwindSwap: null,
  }
}

function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<GameState>
      return { ...initial(), ...saved, avatar: { ...DEFAULT_AVATAR, ...saved.avatar } }
    }
  } catch {
    /* ignore corrupted storage */
  }
  return initial()
}

let uid = 0
const newId = () => `${Date.now().toString(36)}-${(uid++).toString(36)}`

export function useGame() {
  const [state, setState] = useState<GameState>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const stats = useMemo(() => computeStats(state), [state])

  const update = useCallback((patch: Partial<GameState> | ((s: GameState) => Partial<GameState>)) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
  }, [])

  const logActivity = useCallback(
    (activityId: string, cat: Category, xp: number, minutes: number, title?: string) => {
      setState((s) => {
        const entry: Entry = { id: newId(), activityId, cat, xp, minutes, day: dayKey(s.dayOffset), ts: Date.now(), title }
        return { ...s, log: [...s.log, entry] }
      })
    },
    [],
  )

  const demo = useMemo(
    () => ({
      nextDay: () => update((s) => ({ dayOffset: s.dayOffset + 1, unwindSwap: null })),
      backfill: (days: number) =>
        update((s) => {
          const today = dayKey(s.dayOffset)
          const extra: Entry[] = []
          for (let i = 1; i <= days; i++) {
            const day = shiftDay(today, -i)
            const cats: Category[] = ['move', 'calm', 'unwind']
            for (const cat of cats) {
              extra.push({ id: newId(), activityId: 'demo', cat, xp: 30, minutes: 3, day, ts: Date.now() - i * 864e5 })
            }
          }
          return { log: [...extra, ...s.log] }
        }),
      boost: (xp: number) =>
        update((s) => ({
          log: [
            ...s.log,
            { id: newId(), activityId: 'demo', cat: 'move', xp, minutes: 0, day: dayKey(s.dayOffset), ts: Date.now() },
          ],
        })),
      reset: () => {
        localStorage.removeItem(KEY)
        setState(initial())
      },
    }),
    [update],
  )

  return { state, stats, update, logActivity, demo }
}

export type Game = ReturnType<typeof useGame>
