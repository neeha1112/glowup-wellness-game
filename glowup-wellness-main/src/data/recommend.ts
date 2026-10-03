import {
  ACTIVITIES,
  ACTIVITY_BY_ID,
  meditateXp,
  moveXp,
  unwindBonus,
  unwindXp,
  type Activity,
  type Anim,
  type Difficulty,
  type Feeling,
  type Outcome,
  type Pose,
} from './activities'

export interface Option<T extends string = string> {
  id: T
  label: string
  sub?: string
}
export interface Question<T extends string = string> {
  id: string
  q: string
  options: Option<T>[]
}

/* ------------------------------------------------------------------ */
/* Movement: physical context → intensity ladder → effort-based XP     */
/* ------------------------------------------------------------------ */

export type MoveAnswers = {
  wearing: 'comfy' | 'work'
  where: 'home' | 'office' | 'outdoors'
  people: 'alone' | 'others'
  time: '2' | '5' | '10' | '20'
  energy: 'low' | 'okay' | 'high'
  space: 'tiny' | 'some' | 'plenty'
}

export const MOVE_QUESTIONS: Question[] = [
  { id: 'wearing', q: 'What are you wearing?', options: [{ id: 'comfy', label: 'Comfy clothes', sub: 'Gym wear, loungewear' }, { id: 'work', label: 'Workwear', sub: 'Jeans, shirt, office shoes' }] },
  { id: 'where', q: 'Where are you?', options: [{ id: 'home', label: 'Home' }, { id: 'office', label: 'Office' }, { id: 'outdoors', label: 'Outdoors' }] },
  { id: 'people', q: 'Are you around other people?', options: [{ id: 'alone', label: 'Nope, just me' }, { id: 'others', label: 'Yes, people around' }] },
  { id: 'time', q: 'How much time do you have?', options: [{ id: '2', label: '2 minutes' }, { id: '5', label: '5 minutes' }, { id: '10', label: '10 minutes' }, { id: '20', label: '20 minutes' }] },
  { id: 'energy', q: 'How energetic do you feel?', options: [{ id: 'low', label: 'Low', sub: 'Running on fumes' }, { id: 'okay', label: 'Okay', sub: 'Could do something' }, { id: 'high', label: 'High', sub: 'Let\'s go!' }] },
  { id: 'space', q: 'Do you have space to move?', options: [{ id: 'tiny', label: 'Just my spot', sub: 'Desk or chair' }, { id: 'some', label: 'A little room', sub: 'Can take a step or two' }, { id: 'plenty', label: 'Plenty', sub: 'Room to jump around' }] },
]

export const LADDER = ['Stretching', 'Mobility', 'Squats', 'Lunges', 'Jumping'] as const

type Move = { text: string; pose: Pose; anim: Anim }
const m = (text: string, pose: Pose, anim: Anim): Move => ({ text, pose, anim })

/** Each rung has an open version and a discreet version (office clothes / people around). */
const RUNGS: { open: Move[]; discreet: Move[] }[] = [
  {
    open: [m('Reach both arms overhead and stretch tall.', 'reach', 'breathe'), m('Side bend to the left… then to the right.', 'reach', 'sway'), m('Forward fold. Let your head hang heavy.', 'idle', 'squat'), m('Roll your shoulders back, slow and big.', 'idle', 'sway')],
    discreet: [m('Roll your shoulders back 5 times.', 'idle', 'sway'), m('Interlace your fingers and push your palms forward.', 'reach', 'breathe'), m('Ear to shoulder, gently. Then the other side.', 'idle', 'sway'), m('Seated twist. Hold the back of your chair.', 'sit', 'sway')],
  },
  {
    open: [m('Big hip circles, both directions.', 'idle', 'sway'), m('Arm circles: small, then big.', 'cheer', 'bob'), m('Leg swings. Hold something for balance.', 'wave', 'sway'), m('Cat-cow on hands and knees.', 'sit', 'breathe')],
    discreet: [m('Wrist and ankle circles.', 'idle', 'bob'), m('Seated hip opener: ankle on knee, lean forward.', 'sit', 'breathe'), m('Chest opener: clasp your hands behind your back.', 'idle', 'breathe'), m('Slow, quiet calf raises.', 'idle', 'bounce')],
  },
  {
    open: [m('Bodyweight squats. Sit back like there\'s a chair.', 'reach', 'squat'), m('Squats with a 2-second pause at the bottom.', 'reach', 'squat'), m('Wall sit. Hold it!', 'sit', 'still'), m('Glute bridges on the floor.', 'sit', 'breathe')],
    discreet: [m('Chair squats: stand up, sit down, slowly.', 'sit', 'squat'), m('Desk push-ups: hands on the desk edge.', 'reach', 'bob'), m('Standing calf raises, hold the top.', 'idle', 'bounce'), m('Half squats, hands on hips.', 'reach', 'squat')],
  },
  {
    open: [m('Alternating reverse lunges.', 'reach', 'squat'), m('Walking lunges, or lunges in place.', 'reach', 'squat'), m('Side lunges, left and right.', 'reach', 'sway'), m('Lunge hold. Switch legs halfway.', 'yoga', 'still')],
    discreet: [],
  },
  {
    open: [m('Jumping jacks!', 'cheer', 'jump'), m('High knees!', 'wave', 'jump'), m('Squat jumps!', 'cheer', 'jump'), m('Skaters, side to side!', 'wave', 'sway'), m('Fast feet!', 'wave', 'jump')],
    discreet: [],
  },
]

const SESSION_NAMES = ['Stretch Break', 'Mobility Flow', 'Strength Builder', 'Lunge Ladder', 'Cardio Burst']

export interface MovePlan {
  activity: Activity
  minutes: number
  intensity: number
  maxIntensity: number
  reasons: string[]
  discreet: boolean
}

/** The highest rung of the ladder that is realistic for this context, plus why. */
export function moveCap(a: MoveAnswers): { cap: number; reasons: string[]; discreet: boolean } {
  const reasons: string[] = []
  const energyCap = a.energy === 'low' ? 2 : a.energy === 'okay' ? 4 : 5
  let cap = energyCap
  if (a.energy === 'low') reasons.push('Low energy, so we keep it gentle')
  const limit = (n: number, why: string) => {
    if (n < energyCap) reasons.push(why)
    cap = Math.min(cap, n)
  }
  if (a.space === 'tiny') limit(3, 'Not much space, so everything happens on the spot')
  if (a.space === 'some') limit(4, 'Some room, but no jumping around')
  if (a.wearing === 'work') limit(3, 'Workwear, so nothing sweaty')
  if (a.where === 'office') limit(3, 'At the office, so it stays desk-friendly')
  if (a.people === 'others') limit(3, 'People around, so it stays low-key')
  if (a.time === '20' && cap >= 4) reasons.push('20 minutes, so there\'s time for a proper workout')
  if (!reasons.length) reasons.push('You\'re good to go all the way up the ladder')
  const discreet = a.wearing === 'work' || a.where === 'office' || a.people === 'others'
  return { cap, reasons, discreet }
}

export function buildMoveSession(a: MoveAnswers, intensity?: number): MovePlan {
  const { cap, reasons, discreet } = moveCap(a)
  const level = Math.max(1, Math.min(cap, intensity ?? cap))
  const minutes = Number(a.time)
  const total = minutes * 60
  const stepLen = minutes <= 2 ? 20 : minutes <= 5 ? 30 : minutes <= 10 ? 40 : 60
  const n = Math.max(3, Math.round(total / stepLen))
  const pick = (rung: number, i: number) => {
    const r = RUNGS[rung - 1]
    const list = discreet && r.discreet.length ? r.discreet : r.open
    return list[i % list.length]
  }

  const plan: Move[] = []
  const cooldown = n >= 5 ? 1 : 0
  const warm = level === 1 ? 0 : Math.max(1, Math.round(n * 0.25))
  for (let i = 0; i < warm; i++) {
    const rung = 1 + Math.floor((i / warm) * (level - 1))
    plan.push(pick(rung, i))
  }
  const main = n - warm - cooldown
  for (let i = 0; i < main; i++) {
    const rung = level >= 4 && i % 2 === 1 ? level - 1 : level
    plan.push(pick(rung, i + warm))
  }
  if (cooldown) plan.push(discreet ? m('Slow breaths. Shoulders down. Nicely done.', 'idle', 'breathe') : m('Cool down: walk it out and breathe.', 'idle', 'sway'))

  const difficulty: Difficulty = level <= 2 ? 1 : level === 3 ? 2 : 3
  const name = (discreet && level <= 3 ? (a.where === 'office' ? 'Desk-friendly ' : 'Low-key ') : '') + SESSION_NAMES[level - 1]
  const activity: Activity = {
    id: `move-${level}${discreet ? '-d' : ''}`,
    category: 'move',
    title: name,
    emoji: '🤸',
    difficulty,
    minutes,
    kind: 'steps',
    blurb: LADDER.slice(0, level).join(' → '),
    steps: plan.map((s) => ({ ...s, seconds: total / plan.length })),
    xp: moveXp(level, minutes),
  }
  return { activity, minutes, intensity: level, maxIntensity: cap, reasons, discreet }
}

/* ------------------------------------------------------------------ */
/* Meditation: emotional state → matched session → time-based XP       */
/* ------------------------------------------------------------------ */

export type MeditateAnswers = {
  feeling: Feeling
  want: Outcome
  time: '3' | '5' | '10' | '15'
  style: 'guided' | 'quiet'
}

export const MEDITATE_QUESTIONS: Question[] = [
  { id: 'feeling', q: 'How are you feeling right now?', options: [{ id: 'calm', label: 'Calm' }, { id: 'anxious', label: 'Anxious' }, { id: 'frustrated', label: 'Frustrated' }, { id: 'overwhelmed', label: 'Overwhelmed' }, { id: 'tired', label: 'Tired' }] },
  { id: 'want', q: 'What do you want to feel after this?', options: [{ id: 'calmer', label: 'Calmer' }, { id: 'focused', label: 'Focused' }, { id: 'relaxed', label: 'Relaxed' }, { id: 'reset', label: 'Emotionally reset' }] },
  { id: 'time', q: 'How much time do you have?', options: [{ id: '3', label: '3 minutes' }, { id: '5', label: '5 minutes' }, { id: '10', label: '10 minutes' }, { id: '15', label: '15 minutes' }] },
  { id: 'style', q: 'Guided or quiet?', options: [{ id: 'guided', label: 'Guided', sub: 'Talk me through it' }, { id: 'quiet', label: 'Quiet', sub: 'Just a timer and my breath' }] },
]

export interface MeditatePlan {
  activity: Activity
  minutes: number
  why: string
  alternatives: Activity[]
}

function score(act: Activity, a: MeditateAnswers, minutes: number) {
  let s = 0
  if (act.gives?.includes(a.want)) s += 3
  if (act.helps?.includes(a.feeling)) s += 2
  if (a.style === 'quiet' && act.style === 'guided') s -= 4
  if (a.style === 'guided' && act.style === 'quiet') s -= 4
  if (a.style === 'quiet' && act.style === 'quiet') s += 1
  if (minutes <= 5 && act.minutes <= 3) s += 1
  if (minutes >= 10 && act.minutes >= 4) s += 1
  return s
}

const withMinutes = (act: Activity, minutes: number): Activity => ({ ...act, minutes, xp: meditateXp(minutes) })

export function recommendMeditation(a: MeditateAnswers): MeditatePlan {
  const minutes = Number(a.time)
  const ranked = ACTIVITIES.filter((x) => x.category === 'calm' && x.gives)
    .map((x, i) => ({ x, s: score(x, a, minutes) - i * 0.01 }))
    .sort((p, q) => q.s - p.s)
    .map((r) => r.x)
  const best = ranked[0]
  const feeling = a.feeling === 'calm' ? 'calm already' : a.feeling
  const want = a.want === 'reset' ? 'emotionally reset' : a.want
  return {
    activity: withMinutes(best, minutes),
    minutes,
    why: `You're feeling ${feeling} and want to feel ${want}. ${best.reason ?? ''}`.trim(),
    alternatives: ranked.slice(1, 3).map((x) => withMinutes(x, minutes)),
  }
}

/* ------------------------------------------------------------------ */
/* Winding down: one tap → calming sequence → consistency-based XP      */
/* ------------------------------------------------------------------ */

export type UnwindIntent = 'head' | 'body' | 'phone' | 'sleep' | 'calm'
export type UnwindLength = 5 | 15

export const UNWIND_INTENTS: Option<UnwindIntent>[] = [
  { id: 'head', label: 'Clear my head' },
  { id: 'body', label: 'Relax my body' },
  { id: 'phone', label: 'Disconnect from my phone' },
  { id: 'sleep', label: 'Prepare for sleep' },
  { id: 'calm', label: 'Just give me something calming' },
]

const SEQUENCES: Record<UnwindIntent, Record<UnwindLength, [string, number, string?][]>> = {
  head: {
    5: [['dnd', 0.5], ['unload', 1.5], ['longexhale', 1.5], ['rain', 1.5, 'Calming audio']],
    15: [['phonefree', 1], ['unload', 3], ['sleepy478', 3, 'Breathing'], ['reflect', 4], ['rain', 4, 'Calming audio']],
  },
  body: {
    5: [['dnd', 0.5], ['bedstretch', 2], ['longexhale', 1], ['moonscan', 1.5, 'Body relaxation']],
    15: [['phonefree', 1], ['bedstretch', 4], ['sleepy478', 2, 'Breathing'], ['moonscan', 5, 'Body relaxation'], ['waves', 3, 'Calming audio']],
  },
  phone: {
    5: [['dnd', 1], ['phonefree', 1], ['longexhale', 1.5], ['waves', 1.5, 'Calming audio']],
    15: [['dnd', 1], ['phonefree', 2], ['bedstretch', 3], ['reflect', 4], ['waves', 5, 'Calming audio']],
  },
  sleep: {
    5: [['dnd', 0.5], ['sleepy478', 1.5, 'Breathing'], ['bedstretch', 1.5], ['rain', 1.5, 'Calming audio']],
    15: [['phonefree', 1], ['moonscan', 4, 'Body relaxation'], ['sleepy478', 2, 'Breathing'], ['reflect', 3], ['story', 5, 'Sleep story']],
  },
  calm: {
    5: [['dnd', 0.5], ['longexhale', 1.5], ['waves', 3, 'Calming audio']],
    15: [['phonefree', 1], ['longexhale', 3], ['bedstretch', 3], ['waves', 4, 'Calming audio'], ['story', 4, 'Sleep story']],
  },
}

export interface UnwindPlan {
  activity: Activity
  segments: Activity[]
  minutes: number
  bonus: number
}

export function buildWindDown(intent: UnwindIntent, length: UnwindLength, nightsInARow: number): UnwindPlan {
  const segments = SEQUENCES[intent][length].map(([id, minutes, label]) => ({ ...ACTIVITY_BY_ID[id], title: label ?? ACTIVITY_BY_ID[id].title, minutes }))
  const minutes = segments.reduce((s, x) => s + x.minutes, 0)
  const label = UNWIND_INTENTS.find((i) => i.id === intent)!.label
  const activity: Activity = {
    id: `unwind-${intent}-${length}`,
    category: 'unwind',
    title: `${length}-min wind-down`,
    emoji: '🌙',
    difficulty: 1,
    minutes,
    kind: 'steps',
    blurb: label,
    xp: unwindXp(minutes, nightsInARow),
  }
  return { activity, segments, minutes, bonus: unwindBonus(nightsInARow) }
}
