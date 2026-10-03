import type { Category } from './items'

export type Pose = 'idle' | 'cheer' | 'yoga' | 'tree' | 'sit' | 'wave' | 'sleep' | 'reach'
export type Anim = 'bob' | 'bounce' | 'sway' | 'squat' | 'jump' | 'breathe' | 'still'
export type Kind = 'steps' | 'breath' | 'story' | 'sound' | 'journal'
export type Difficulty = 1 | 2 | 3

export interface Step {
  text: string
  seconds: number
  pose?: Pose
  anim?: Anim
}

export interface Activity {
  id: string
  category: Category
  title: string
  emoji: string
  difficulty: Difficulty
  minutes: number
  durations?: number[]
  blurb: string
  kind: Kind
  steps?: Step[]
  breath?: { inhale: number; hold: number; exhale: number; hold2: number }
  sound?: 'rain' | 'waves'
  /** Pre-computed reward for generated sessions (overrides the difficulty formula). */
  xp?: number
  /** Meditation matching tags. */
  helps?: Feeling[]
  gives?: Outcome[]
  style?: 'guided' | 'quiet' | 'either'
  reason?: string
}

export type Feeling = 'calm' | 'anxious' | 'frustrated' | 'overwhelmed' | 'tired'
export type Outcome = 'calmer' | 'focused' | 'relaxed' | 'reset'

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }
const DIFFICULTY_MULT: Record<Difficulty, number> = { 1: 1, 2: 1.5, 3: 2.2 }
export const COMPLETION_BONUS = 10

export function xpFor(difficulty: Difficulty, minutes: number): number {
  return Math.round(minutes * 8 * DIFFICULTY_MULT[difficulty]) + COMPLETION_BONUS
}

/** Movement rewards effort: intensity rung (1–5) × time. */
export const INTENSITY_MULT = [1, 1, 1.25, 1.5, 1.85, 2.2]
export const moveXp = (intensity: number, minutes: number) => Math.round(minutes * 8 * INTENSITY_MULT[intensity]) + COMPLETION_BONUS

/** Meditation rewards time spent. */
export const MEDITATE_XP_PER_MIN = 10
export const meditateXp = (minutes: number) => Math.round(minutes * MEDITATE_XP_PER_MIN) + COMPLETION_BONUS

/** Winding down rewards consistency: time plus a bonus for every night in a row (capped). */
export const UNWIND_XP_PER_MIN = 6
export const UNWIND_NIGHT_BONUS = 5
export const UNWIND_BONUS_CAP = 7
export const unwindBonus = (nightsInARow: number) => Math.min(nightsInARow, UNWIND_BONUS_CAP) * UNWIND_NIGHT_BONUS
export const unwindXp = (minutes: number, nightsInARow: number) => Math.round(minutes * UNWIND_XP_PER_MIN) + COMPLETION_BONUS + unwindBonus(nightsInARow)

export const CATEGORY_INFO: Record<Category, { name: string; tagline: string; color: string; dark: string; light: string; emoji: string }> = {
  move: { name: 'Move', tagline: 'A workout that fits where you are', color: '#D4F06B', dark: '#A9C93C', light: 'rgba(212,240,107,0.12)', emoji: '🤸' },
  calm: { name: 'Meditate', tagline: 'Matched to how you feel', color: '#A9ADFF', dark: '#7C80F2', light: 'rgba(169,173,255,0.12)', emoji: '🧘' },
  unwind: { name: 'Wind down', tagline: 'A calm sequence before sleep', color: '#C7B8FF', dark: '#9C8BF0', light: 'rgba(199,184,255,0.12)', emoji: '🌙' },
}

export const ACTIVITIES: Activity[] = [
  // ---------- MOVE ----------
  {
    id: 'wakeup', category: 'move', title: 'Wake-up Stretch', emoji: '🌤️', difficulty: 1, minutes: 2, kind: 'steps',
    blurb: 'A gentle full-body stretch to shake off the sleepies.',
    steps: [
      { text: 'Stand tall. Roll your shoulders back 5 times.', seconds: 20, pose: 'idle', anim: 'sway' },
      { text: 'Reach both arms up high and stretch toward the ceiling.', seconds: 25, pose: 'reach', anim: 'breathe' },
      { text: 'Lean gently to the left… and hold.', seconds: 20, pose: 'reach', anim: 'sway' },
      { text: 'Now lean to the right… and hold.', seconds: 20, pose: 'reach', anim: 'sway' },
      { text: 'Slowly roll down into a forward fold. Let your head hang.', seconds: 35, pose: 'idle', anim: 'squat' },
    ],
  },
  {
    id: 'desk', category: 'move', title: 'Desk Reset', emoji: '💻', difficulty: 1, minutes: 3, kind: 'steps',
    blurb: 'Undo the laptop hunch in three minutes flat.',
    steps: [
      { text: 'Circle your wrists 10 times each way.', seconds: 25, pose: 'idle', anim: 'bob' },
      { text: 'Clasp your hands behind you and open your chest.', seconds: 30, pose: 'idle', anim: 'breathe' },
      { text: 'Slow neck rolls — ear to shoulder, chin to chest.', seconds: 35, pose: 'idle', anim: 'sway' },
      { text: 'Seated twist to the left, hold the chair back.', seconds: 30, pose: 'sit', anim: 'sway' },
      { text: 'Seated twist to the right.', seconds: 30, pose: 'sit', anim: 'sway' },
      { text: 'Shrug shoulders up to your ears… and drop. x5', seconds: 30, pose: 'cheer', anim: 'bounce' },
    ],
  },
  {
    id: 'tree', category: 'move', title: 'Tree Pose Balance', emoji: '🌳', difficulty: 2, minutes: 2, kind: 'steps',
    blurb: 'Find your wobble, then find your balance.',
    steps: [
      { text: 'Stand on your left foot. Place your right foot on your calf or thigh.', seconds: 15, pose: 'tree', anim: 'sway' },
      { text: 'Hands together above your head. Hold steady!', seconds: 40, pose: 'tree', anim: 'sway' },
      { text: 'Switch! Stand on your right foot.', seconds: 15, pose: 'tree', anim: 'sway' },
      { text: 'Hands up, eyes on one spot. Hold!', seconds: 40, pose: 'tree', anim: 'sway' },
      { text: 'Shake it out. You stayed rooted 🌱', seconds: 10, pose: 'cheer', anim: 'bounce' },
    ],
  },
  {
    id: 'squats', category: 'move', title: '20 Squat Challenge', emoji: '🍑', difficulty: 2, minutes: 2, kind: 'steps',
    blurb: 'Twenty squats, two rounds, zero excuses.',
    steps: [
      { text: 'Feet hip-width, arms out in front. Ready?', seconds: 10, pose: 'idle', anim: 'bob' },
      { text: 'Round 1: 10 slow squats. Sit back like there\'s a chair.', seconds: 40, pose: 'reach', anim: 'squat' },
      { text: 'Quick breather. Shake your legs.', seconds: 20, pose: 'idle', anim: 'bounce' },
      { text: 'Round 2: 10 more squats. Chest proud!', seconds: 40, pose: 'reach', anim: 'squat' },
      { text: 'Done! Stand tall and breathe.', seconds: 10, pose: 'cheer', anim: 'bounce' },
    ],
  },
  {
    id: 'hips', category: 'move', title: 'Hip Mobility Flow', emoji: '🦋', difficulty: 2, minutes: 5, kind: 'steps',
    blurb: 'Open up tight hips from all that sitting.',
    steps: [
      { text: 'Big hip circles, 10 each direction.', seconds: 40, pose: 'idle', anim: 'sway' },
      { text: 'Sit down. Butterfly stretch — soles of feet together.', seconds: 50, pose: 'sit', anim: 'breathe' },
      { text: 'Low lunge, left leg forward. Sink your hips.', seconds: 45, pose: 'reach', anim: 'squat' },
      { text: 'Low lunge, right leg forward.', seconds: 45, pose: 'reach', anim: 'squat' },
      { text: '90/90 sit — rotate knees side to side slowly.', seconds: 60, pose: 'sit', anim: 'sway' },
      { text: 'Happy baby or just lie back and breathe.', seconds: 60, pose: 'sit', anim: 'breathe' },
    ],
  },
  {
    id: 'sunsal', category: 'move', title: 'Sun Salutation', emoji: '☀️', difficulty: 2, minutes: 4, kind: 'steps',
    blurb: 'The classic yoga flow, one breath per move.',
    steps: [
      { text: 'Mountain pose. Hands at heart.', seconds: 20, pose: 'idle', anim: 'breathe' },
      { text: 'Inhale, sweep arms up overhead.', seconds: 20, pose: 'yoga', anim: 'breathe' },
      { text: 'Exhale, fold forward.', seconds: 25, pose: 'idle', anim: 'squat' },
      { text: 'Step back to plank, lower down slowly.', seconds: 30, pose: 'reach', anim: 'still' },
      { text: 'Cobra — lift your chest, shoulders soft.', seconds: 30, pose: 'reach', anim: 'breathe' },
      { text: 'Downward dog. Pedal your feet.', seconds: 40, pose: 'reach', anim: 'sway' },
      { text: 'Step forward, rise up, arms overhead.', seconds: 35, pose: 'yoga', anim: 'breathe' },
      { text: 'Hands to heart. Beautiful. ☀️', seconds: 40, pose: 'idle', anim: 'breathe' },
    ],
  },
  {
    id: 'plank', category: 'move', title: 'Plank Ladder', emoji: '🪵', difficulty: 3, minutes: 3, kind: 'steps',
    blurb: 'Climb the ladder: 20s, 30s, 40s planks.',
    steps: [
      { text: 'Forearm plank — 20 seconds. Belly tight!', seconds: 20, pose: 'reach', anim: 'still' },
      { text: 'Rest on your knees.', seconds: 20, pose: 'sit', anim: 'breathe' },
      { text: 'Plank — 30 seconds. You\'ve got this.', seconds: 30, pose: 'reach', anim: 'still' },
      { text: 'Rest.', seconds: 20, pose: 'sit', anim: 'breathe' },
      { text: 'Final plank — 40 seconds! Breathe through it.', seconds: 40, pose: 'reach', anim: 'still' },
      { text: 'Collapse dramatically. You earned it. 🏆', seconds: 50, pose: 'cheer', anim: 'bounce' },
    ],
  },
  {
    id: 'hiit', category: 'move', title: 'Mini HIIT Party', emoji: '🔥', difficulty: 3, minutes: 7, kind: 'steps',
    blurb: '30 seconds on, 15 off. Get that heart pumping.',
    steps: [
      { text: 'Jumping jacks!', seconds: 30, pose: 'cheer', anim: 'jump' },
      { text: 'Rest', seconds: 15, pose: 'idle', anim: 'breathe' },
      { text: 'High knees!', seconds: 30, pose: 'wave', anim: 'jump' },
      { text: 'Rest', seconds: 15, pose: 'idle', anim: 'breathe' },
      { text: 'Squat jumps!', seconds: 30, pose: 'cheer', anim: 'jump' },
      { text: 'Rest', seconds: 15, pose: 'idle', anim: 'breathe' },
      { text: 'Mountain climbers!', seconds: 30, pose: 'reach', anim: 'bounce' },
      { text: 'Rest', seconds: 15, pose: 'idle', anim: 'breathe' },
      { text: 'Round 2 — jumping jacks!', seconds: 30, pose: 'cheer', anim: 'jump' },
      { text: 'Rest', seconds: 15, pose: 'idle', anim: 'breathe' },
      { text: 'Skaters side to side!', seconds: 30, pose: 'wave', anim: 'sway' },
      { text: 'Rest', seconds: 15, pose: 'idle', anim: 'breathe' },
      { text: 'Burpees (or step-backs)!', seconds: 30, pose: 'cheer', anim: 'jump' },
      { text: 'Rest', seconds: 15, pose: 'idle', anim: 'breathe' },
      { text: 'Final push — fast feet!', seconds: 30, pose: 'wave', anim: 'jump' },
      { text: 'Cool down. Walk it out and breathe.', seconds: 75, pose: 'idle', anim: 'sway' },
    ],
  },
  {
    id: 'warrior', category: 'move', title: 'Warrior Flow', emoji: '⚔️', difficulty: 3, minutes: 8, kind: 'steps',
    blurb: 'Strong, steady standing yoga for brave days.',
    steps: [
      { text: 'Mountain pose. Ground through your feet.', seconds: 40, pose: 'idle', anim: 'breathe' },
      { text: 'Warrior I, left leg forward. Arms high.', seconds: 60, pose: 'yoga', anim: 'still' },
      { text: 'Warrior II — open arms wide, gaze forward.', seconds: 60, pose: 'reach', anim: 'still' },
      { text: 'Reverse warrior — lean back, reach up.', seconds: 50, pose: 'yoga', anim: 'sway' },
      { text: 'Switch sides. Warrior I, right leg forward.', seconds: 60, pose: 'yoga', anim: 'still' },
      { text: 'Warrior II.', seconds: 60, pose: 'reach', anim: 'still' },
      { text: 'Reverse warrior.', seconds: 50, pose: 'yoga', anim: 'sway' },
      { text: 'Chair pose — sit back, arms up. Hold!', seconds: 40, pose: 'yoga', anim: 'squat' },
      { text: 'Child\'s pose. Rest and breathe.', seconds: 60, pose: 'sit', anim: 'breathe' },
    ],
  },

  // ---------- CALM ----------
  {
    id: 'box', category: 'calm', title: 'Box Breathing', emoji: '🟦', difficulty: 1, minutes: 2, durations: [1, 2, 4], kind: 'breath',
    blurb: 'In 4, hold 4, out 4, hold 4. Used by athletes & astronauts.',
    breath: { inhale: 4, hold: 4, exhale: 4, hold2: 4 },
    helps: ['anxious', 'overwhelmed'], gives: ['calmer', 'focused'], style: 'either',
    reason: 'An even, counted rhythm gives a racing mind something steady to hold on to.',
  },
  {
    id: 'release', category: 'calm', title: 'Let It Go', emoji: '✊', difficulty: 1, minutes: 3, kind: 'steps',
    blurb: 'Squeeze the tension out, then breathe it away.',
    helps: ['frustrated'], gives: ['calmer', 'reset'], style: 'guided',
    reason: 'Frustration lives in the body. Clenching and releasing burns it off fast.',
    steps: [
      { text: 'Make tight fists. Squeeze… and let go. Twice more.', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Big breath in through your nose. Sigh it out through your mouth.', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Name the feeling, silently: "This is frustration."', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Picture setting it down on the floor beside you.', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Unclench your jaw. Drop your shoulders.', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Three slow breaths. You can pick it back up later, or not.', seconds: 30, pose: 'sit', anim: 'breathe' },
    ],
  },
  {
    id: 'bright', category: 'calm', title: 'Bright Breath', emoji: '⚡', difficulty: 1, minutes: 3, kind: 'breath',
    blurb: 'A quicker, lifting rhythm for when you are running on empty.',
    breath: { inhale: 3, hold: 1, exhale: 2, hold2: 0 },
    helps: ['tired'], gives: ['focused', 'reset'], style: 'either',
    reason: 'Slightly longer inhales gently wake the body up without caffeine.',
  },
  {
    id: 'quiet', category: 'calm', title: 'Quiet Sit', emoji: '🤍', difficulty: 1, minutes: 5, kind: 'steps',
    blurb: 'Almost no words. Just you, a timer, and your breath.',
    helps: ['calm', 'overwhelmed', 'tired', 'anxious', 'frustrated'], gives: ['calmer', 'relaxed', 'focused', 'reset'], style: 'quiet',
    reason: 'Sometimes the kindest thing is no instructions at all.',
    steps: [
      { text: 'Settle in.', seconds: 20, pose: 'sit', anim: 'breathe' },
      { text: 'Breathe.', seconds: 100, pose: 'sit', anim: 'breathe' },
      { text: '…', seconds: 100, pose: 'sit', anim: 'breathe' },
      { text: 'Still here.', seconds: 60, pose: 'sit', anim: 'breathe' },
      { text: 'Come back slowly.', seconds: 20, pose: 'sit', anim: 'breathe' },
    ],
  },
  {
    id: 'mindful1', category: 'calm', title: 'Mindful Breathing', emoji: '🫧', difficulty: 1, minutes: 1, kind: 'steps',
    blurb: 'Just… being here, one breath at a time.',
    helps: ['calm', 'overwhelmed'], gives: ['calmer', 'focused'], style: 'guided',
    reason: 'Gently noticing your breath is the simplest way back to the present.',
    steps: [
      { text: 'Get comfy. Let your shoulders drop.', seconds: 12, pose: 'sit', anim: 'breathe' },
      { text: 'Notice the air moving in and out of your nose.', seconds: 16, pose: 'sit', anim: 'breathe' },
      { text: 'If your mind wanders, that\'s okay. Gently come back.', seconds: 16, pose: 'sit', anim: 'breathe' },
      { text: 'One more slow breath. Smile a tiny bit.', seconds: 16, pose: 'sit', anim: 'breathe' },
    ],
  },
  {
    id: 'ground', category: 'calm', title: '5-4-3-2-1 Grounding', emoji: '🖐️', difficulty: 1, minutes: 3, kind: 'steps',
    blurb: 'A senses game that pulls you out of spiralling thoughts.',
    helps: ['anxious', 'frustrated', 'overwhelmed'], gives: ['calmer', 'reset'], style: 'guided',
    reason: 'Naming what you can see and hear pulls you out of your head and into the room.',
    steps: [
      { text: 'Look around. Name 5 things you can SEE.', seconds: 40, pose: 'sit', anim: 'breathe' },
      { text: 'Notice 4 things you can FEEL — your feet, your clothes…', seconds: 40, pose: 'sit', anim: 'breathe' },
      { text: 'Listen for 3 things you can HEAR.', seconds: 35, pose: 'sit', anim: 'breathe' },
      { text: 'Find 2 things you can SMELL.', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Notice 1 thing you can TASTE.', seconds: 20, pose: 'sit', anim: 'breathe' },
      { text: 'Take a deep breath. You\'re here. You\'re okay.', seconds: 15, pose: 'sit', anim: 'breathe' },
    ],
  },
  {
    id: '478', category: 'calm', title: '4-7-8 Breath', emoji: '🌬️', difficulty: 2, minutes: 3, durations: [2, 3, 5], kind: 'breath',
    blurb: 'A long, slow exhale that tells your body it\'s safe.',
    breath: { inhale: 4, hold: 7, exhale: 8, hold2: 0 },
    helps: ['anxious', 'frustrated'], gives: ['calmer', 'relaxed'], style: 'either',
    reason: 'A long exhale switches on your body\'s rest-and-digest mode.',
  },
  {
    id: 'bodyscan', category: 'calm', title: 'Body Scan', emoji: '✨', difficulty: 2, minutes: 5, durations: [3, 5, 8], kind: 'steps',
    blurb: 'Travel from toes to head, softening as you go.',
    helps: ['tired', 'overwhelmed', 'calm'], gives: ['relaxed'], style: 'guided',
    reason: 'Moving attention through the body releases tension you didn\'t know you were holding.',
    steps: [
      { text: 'Close your eyes. Take three slow breaths.', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Bring attention to your feet and toes. Let them soften.', seconds: 35, pose: 'sit', anim: 'breathe' },
      { text: 'Move up to your calves and knees. Release any tension.', seconds: 35, pose: 'sit', anim: 'breathe' },
      { text: 'Your hips and lower back. Let them feel heavy.', seconds: 35, pose: 'sit', anim: 'breathe' },
      { text: 'Your belly rises and falls. Nothing to fix.', seconds: 35, pose: 'sit', anim: 'breathe' },
      { text: 'Your hands, arms, and shoulders. Let them melt.', seconds: 40, pose: 'sit', anim: 'breathe' },
      { text: 'Your jaw, your cheeks, the space between your eyebrows.', seconds: 40, pose: 'sit', anim: 'breathe' },
      { text: 'Feel your whole body at once. Rest here.', seconds: 30, pose: 'sit', anim: 'breathe' },
    ],
  },
  {
    id: 'kindness', category: 'calm', title: 'Loving Kindness', emoji: '💗', difficulty: 2, minutes: 4, kind: 'steps',
    blurb: 'Send good vibes to yourself, then the world.',
    helps: ['frustrated', 'calm'], gives: ['reset', 'relaxed'], style: 'guided',
    reason: 'Wishing others well softens resentment and resets your mood.',
    steps: [
      { text: 'Hand on heart. Breathe in slowly.', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Silently say: "May I be happy. May I be at ease."', seconds: 45, pose: 'sit', anim: 'breathe' },
      { text: 'Picture someone you love. "May you be happy."', seconds: 45, pose: 'sit', anim: 'breathe' },
      { text: 'Picture someone neutral — a barista, a neighbour. Same wish.', seconds: 45, pose: 'sit', anim: 'breathe' },
      { text: 'Now everyone, everywhere. "May all beings be at ease."', seconds: 45, pose: 'sit', anim: 'breathe' },
      { text: 'Notice how you feel. 💗', seconds: 30, pose: 'sit', anim: 'breathe' },
    ],
  },
  {
    id: 'focus', category: 'calm', title: 'Focus Flame', emoji: '🕯️', difficulty: 3, minutes: 6, durations: [4, 6, 10], kind: 'steps',
    blurb: 'Count breaths to ten without losing count. Harder than it sounds.',
    helps: ['calm', 'tired'], gives: ['focused'], style: 'guided',
    reason: 'Counting breaths trains the exact muscle you need for deep focus.',
    steps: [
      { text: 'Sit upright. Soft gaze at a single point.', seconds: 40, pose: 'sit', anim: 'still' },
      { text: 'Count each exhale: one… two… up to ten.', seconds: 60, pose: 'sit', anim: 'breathe' },
      { text: 'Lost count? No drama. Start again at one.', seconds: 60, pose: 'sit', anim: 'breathe' },
      { text: 'Keep going. Notice the pause after each exhale.', seconds: 60, pose: 'sit', anim: 'breathe' },
      { text: 'Let the counting go. Just watch the breath.', seconds: 60, pose: 'sit', anim: 'breathe' },
      { text: 'Slowly open your eyes. Sharp and steady. 🕯️', seconds: 80, pose: 'sit', anim: 'breathe' },
    ],
  },

  // ---------- UNWIND ----------
  {
    id: 'story', category: 'unwind', title: 'The Lighthouse Cat', emoji: '🐈', difficulty: 1, minutes: 5, kind: 'story',
    blurb: 'A slow, sleepy story. No cliffhangers, promise.',
  },
  {
    id: 'rain', category: 'unwind', title: 'Rain on the Window', emoji: '🌧️', difficulty: 1, minutes: 5, kind: 'sound', sound: 'rain',
    blurb: 'Soft rain sounds and a very slow breathing guide.',
  },
  {
    id: 'waves', category: 'unwind', title: 'Ocean Drift', emoji: '🌊', difficulty: 1, minutes: 5, kind: 'sound', sound: 'waves',
    blurb: 'Waves rolling in… and out… and in.',
  },
  {
    id: 'gratitude', category: 'unwind', title: 'Three Good Things', emoji: '📓', difficulty: 1, minutes: 3, kind: 'journal',
    blurb: 'Write down three small good things from today.',
  },
  {
    id: 'moonscan', category: 'unwind', title: 'Moonlight Body Scan', emoji: '🌙', difficulty: 1, minutes: 5, kind: 'steps',
    blurb: 'Lie down and let each part of you fall asleep first.',
    steps: [
      { text: 'Lie down. Let the bed hold all of your weight.', seconds: 40, pose: 'sleep', anim: 'breathe' },
      { text: 'Your toes are falling asleep… let them go.', seconds: 40, pose: 'sleep', anim: 'breathe' },
      { text: 'Your legs feel heavy and warm.', seconds: 40, pose: 'sleep', anim: 'breathe' },
      { text: 'Your belly softens with every breath.', seconds: 40, pose: 'sleep', anim: 'breathe' },
      { text: 'Your arms are heavy. Your hands are still.', seconds: 40, pose: 'sleep', anim: 'breathe' },
      { text: 'Your face relaxes. Your thoughts slow down.', seconds: 50, pose: 'sleep', anim: 'breathe' },
      { text: 'Nothing left to do today. Drift…', seconds: 50, pose: 'sleep', anim: 'breathe' },
    ],
  },
  {
    id: 'sleepy478', category: 'unwind', title: 'Sleepy 4-7-8', emoji: '😴', difficulty: 1, minutes: 4, kind: 'breath',
    blurb: 'The breathing pattern made for falling asleep.',
    breath: { inhale: 4, hold: 7, exhale: 8, hold2: 0 },
  },
  {
    id: 'longexhale', category: 'unwind', title: 'Long Exhale Breathing', emoji: '🌬️', difficulty: 1, minutes: 2, kind: 'breath',
    blurb: 'In for 4, out for 6. Nothing to hold.',
    breath: { inhale: 4, hold: 0, exhale: 6, hold2: 0 },
  },
  {
    id: 'dnd', category: 'unwind', title: 'Do Not Disturb', emoji: '📵', difficulty: 1, minutes: 1, kind: 'steps',
    blurb: 'Quiet the phone before anything else.',
    steps: [
      { text: 'Switch your phone to Do Not Disturb.', seconds: 20, pose: 'sit', anim: 'breathe' },
      { text: 'Turn the brightness all the way down.', seconds: 20, pose: 'sit', anim: 'breathe' },
      { text: 'Good. Everything else can wait until morning.', seconds: 20, pose: 'sit', anim: 'breathe' },
    ],
  },
  {
    id: 'phonefree', category: 'unwind', title: 'Phone-free Moment', emoji: '🌘', difficulty: 1, minutes: 1, kind: 'steps',
    blurb: 'Loosen the grip of the screen.',
    steps: [
      { text: 'Turn on Do Not Disturb. When this ends, the phone goes face-down.', seconds: 20, pose: 'sit', anim: 'breathe' },
      { text: 'Notice any urge to check one more thing. Let it pass like a wave.', seconds: 20, pose: 'sit', anim: 'breathe' },
      { text: 'Nothing out there needs you tonight.', seconds: 20, pose: 'sit', anim: 'breathe' },
    ],
  },
  {
    id: 'bedstretch', category: 'unwind', title: 'Gentle Stretch', emoji: '🛏️', difficulty: 1, minutes: 2, kind: 'steps',
    blurb: 'Slow stretches you can do on the bed.',
    steps: [
      { text: 'Sit on the bed. Roll your neck slowly, side to side.', seconds: 30, pose: 'sit', anim: 'sway' },
      { text: 'Reach your arms up… then fold forward over your legs.', seconds: 30, pose: 'reach', anim: 'breathe' },
      { text: 'Lie back and hug your knees to your chest.', seconds: 30, pose: 'sleep', anim: 'breathe' },
      { text: 'Let your knees fall to one side… then the other.', seconds: 30, pose: 'sleep', anim: 'sway' },
    ],
  },
  {
    id: 'unload', category: 'unwind', title: 'Mental Unload', emoji: '🍃', difficulty: 1, minutes: 2, kind: 'steps',
    blurb: 'Set down the thoughts that keep circling.',
    steps: [
      { text: 'What\'s still buzzing in your head? Just notice it.', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Picture each thought as a leaf landing on a slow stream.', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Watch it float away. Here comes another. Let that one go too.', seconds: 30, pose: 'sit', anim: 'breathe' },
      { text: 'Anything important will still be there tomorrow.', seconds: 30, pose: 'sit', anim: 'breathe' },
    ],
  },
  {
    id: 'reflect', category: 'unwind', title: 'Guided Reflection', emoji: '🕯️', difficulty: 1, minutes: 3, kind: 'steps',
    blurb: 'A few soft questions to close the day.',
    steps: [
      { text: 'Think of one good moment from today, however small.', seconds: 40, pose: 'sleep', anim: 'breathe' },
      { text: 'What is one thing you can let go of until tomorrow?', seconds: 40, pose: 'sleep', anim: 'breathe' },
      { text: 'Who or what are you grateful for tonight?', seconds: 40, pose: 'sleep', anim: 'breathe' },
      { text: 'Tell yourself: today was enough. I did enough.', seconds: 40, pose: 'sleep', anim: 'breathe' },
    ],
  },
]

export const ACTIVITY_BY_ID: Record<string, Activity> = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]))

export const STORY = [
  'Once upon a time, on a quiet island, there was a small white lighthouse.',
  'And in the lighthouse lived a round, sleepy cat named Biscuit.',
  'Every evening, Biscuit climbed the spiral stairs. Slowly. One step… at a time.',
  'At the top, the great lamp hummed softly, warm as a cup of tea.',
  'Biscuit curled up beside it and watched the sea turn from blue… to grey… to silver.',
  'Far away, a little fishing boat was heading home. Its lantern bobbed gently.',
  'The lamp turned, and turned, and turned, drawing slow circles of light on the water.',
  'Biscuit\'s eyes followed the light. Around… and around… and around.',
  'The waves below whispered against the rocks. Shhh… shhh… shhh.',
  'The little boat reached the harbour. Its lantern blinked out. Everyone was safe.',
  'Biscuit stretched one paw, then the other, and tucked her nose under her tail.',
  'The stars came out, one by one, like someone lighting tiny candles.',
  'There was nothing left to watch over. The lamp would keep turning on its own.',
  'Biscuit let out a long, slow breath… and closed her eyes.',
  'And so can you. Goodnight. 🌙',
]
