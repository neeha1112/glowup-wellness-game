export type Slot = 'hair' | 'top' | 'bottom' | 'shoes' | 'accessory' | 'background'
export type Category = 'move' | 'calm' | 'unwind'
export type Body = 'girl' | 'boy'

export type Unlock =
  | { type: 'xp'; value: number }
  | { type: 'level'; value: number }
  | { type: 'streak'; value: number }
  | { type: 'unwindStreak'; value: number }
  | { type: 'category'; cat: Category; value: number }

export interface Item {
  id: string
  slot: Slot
  name: string
  emoji: string
  unlock: Unlock | null
  /** Omitted = available for every body type. */
  for?: Body
}

export interface AvatarConfig {
  body: Body
  skin: string
  hairColor: string
  hair: string
  top: string
  bottom: string
  shoes: string
  accessory: string
  background: string
}

export const SKIN_TONES = ['#FFE0CC', '#F7C9A6', '#E9AC80', '#C98A55', '#8F5A32', '#5E3B22']
export const HAIR_COLORS = ['#2B2118', '#5B3A29', '#A9532B', '#EBC57C', '#F49AC1', '#8C8FFF', '#5FC9A8', '#E8E4DC']

export const SLOT_LABELS: Record<Slot, string> = {
  hair: 'Hair',
  top: 'Tops',
  bottom: 'Bottoms',
  shoes: 'Shoes',
  accessory: 'Extras',
  background: 'Worlds',
}

export const ITEMS: Item[] = [
  // Hair
  { id: 'long', slot: 'hair', name: 'Long & Lovely', emoji: '💇', unlock: null, for: 'girl' },
  { id: 'bob', slot: 'hair', name: 'Cute Bob', emoji: '💇', unlock: null, for: 'girl' },
  { id: 'buns', slot: 'hair', name: 'Space Buns', emoji: '💇', unlock: null, for: 'girl' },
  { id: 'side', slot: 'hair', name: 'Side Part', emoji: '💇', unlock: null, for: 'boy' },
  { id: 'spiky', slot: 'hair', name: 'Spiky', emoji: '💇', unlock: null, for: 'boy' },
  { id: 'buzz', slot: 'hair', name: 'Buzz Cut', emoji: '💇', unlock: null, for: 'boy' },
  { id: 'short', slot: 'hair', name: 'Short Crop', emoji: '💇', unlock: null },
  { id: 'ponytail', slot: 'hair', name: 'Sporty Pony', emoji: '🎀', unlock: { type: 'category', cat: 'move', value: 100 }, for: 'girl' },
  { id: 'quiff', slot: 'hair', name: 'Big Quiff', emoji: '🕺', unlock: { type: 'category', cat: 'move', value: 100 }, for: 'boy' },
  { id: 'curly', slot: 'hair', name: 'Cloud Curls', emoji: '☁️', unlock: { type: 'level', value: 4 } },

  // Tops
  { id: 'tee', slot: 'top', name: 'Comfy Tee', emoji: '👕', unlock: null },
  { id: 'tank', slot: 'top', name: 'Leafy Tank', emoji: '🎽', unlock: null },
  { id: 'hoodie', slot: 'top', name: 'Cloud Hoodie', emoji: '🧥', unlock: { type: 'xp', value: 200 } },
  { id: 'sweater', slot: 'top', name: 'Cocoa Sweater', emoji: '🧶', unlock: { type: 'category', cat: 'calm', value: 150 } },
  { id: 'pj', slot: 'top', name: 'Starry PJs', emoji: '🌙', unlock: { type: 'category', cat: 'unwind', value: 80 } },
  { id: 'jersey', slot: 'top', name: 'Champ Jersey', emoji: '🏅', unlock: { type: 'category', cat: 'move', value: 250 } },
  { id: 'startop', slot: 'top', name: 'Superstar Fit', emoji: '⭐', unlock: { type: 'streak', value: 7 } },
  { id: 'rainbow', slot: 'top', name: 'Rainbow Knit', emoji: '🌈', unlock: { type: 'level', value: 7 } },

  // Bottoms
  { id: 'shorts', slot: 'bottom', name: 'Denim Shorts', emoji: '🩳', unlock: null },
  { id: 'skirt', slot: 'bottom', name: 'Pleated Skirt', emoji: '👗', unlock: null, for: 'girl' },
  { id: 'cargo', slot: 'bottom', name: 'Cargo Pants', emoji: '👖', unlock: null, for: 'boy' },
  { id: 'joggers', slot: 'bottom', name: 'Joggers', emoji: '👖', unlock: { type: 'xp', value: 100 } },
  { id: 'plaid', slot: 'bottom', name: 'Plaid Skirt', emoji: '🧺', unlock: { type: 'category', cat: 'calm', value: 250 }, for: 'girl' },
  { id: 'cords', slot: 'bottom', name: 'Cosy Cords', emoji: '🤎', unlock: { type: 'category', cat: 'calm', value: 250 }, for: 'boy' },
  { id: 'pjpants', slot: 'bottom', name: 'PJ Pants', emoji: '😴', unlock: { type: 'category', cat: 'unwind', value: 160 } },
  { id: 'leggings', slot: 'bottom', name: 'Power Tights', emoji: '⚡', unlock: { type: 'category', cat: 'move', value: 350 } },

  // Shoes
  { id: 'sneakers', slot: 'shoes', name: 'Sneakers', emoji: '👟', unlock: null },
  { id: 'hightops', slot: 'shoes', name: 'Red High-tops', emoji: '👟', unlock: { type: 'category', cat: 'move', value: 150 } },
  { id: 'boots', slot: 'shoes', name: 'Chonky Boots', emoji: '🥾', unlock: { type: 'xp', value: 500 } },
  { id: 'slippers', slot: 'shoes', name: 'Bunny Slippers', emoji: '🐰', unlock: { type: 'unwindStreak', value: 3 } },
  { id: 'loafers', slot: 'shoes', name: 'Cherry Loafers', emoji: '🍒', unlock: { type: 'category', cat: 'calm', value: 350 } },
  { id: 'rocket', slot: 'shoes', name: 'Rocket Kicks', emoji: '🚀', unlock: { type: 'streak', value: 30 } },

  // Accessories
  { id: 'none', slot: 'accessory', name: 'Nothing', emoji: '✖️', unlock: null },
  { id: 'glasses', slot: 'accessory', name: 'Round Specs', emoji: '👓', unlock: null },
  { id: 'headphones', slot: 'accessory', name: 'Zen Headphones', emoji: '🎧', unlock: { type: 'category', cat: 'calm', value: 60 } },
  { id: 'flower', slot: 'accessory', name: 'Daisy Clip', emoji: '🌼', unlock: { type: 'xp', value: 300 }, for: 'girl' },
  { id: 'cap', slot: 'accessory', name: 'Blue Cap', emoji: '🧢', unlock: { type: 'xp', value: 300 }, for: 'boy' },
  { id: 'beard', slot: 'accessory', name: 'Cosy Beard', emoji: '🧔', unlock: { type: 'level', value: 3 }, for: 'boy' },
  { id: 'catears', slot: 'accessory', name: 'Kitty Ears', emoji: '🐱', unlock: { type: 'streak', value: 3 } },
  { id: 'mask', slot: 'accessory', name: 'Sleep Mask', emoji: '😪', unlock: { type: 'category', cat: 'unwind', value: 120 } },
  { id: 'horns', slot: 'accessory', name: 'Little Devil', emoji: '😈', unlock: { type: 'xp', value: 1000 } },
  { id: 'crown', slot: 'accessory', name: 'Streak Crown', emoji: '👑', unlock: { type: 'streak', value: 14 } },
  { id: 'halo', slot: 'accessory', name: 'Glow Halo', emoji: '😇', unlock: { type: 'level', value: 10 } },

  // Backgrounds
  { id: 'sky', slot: 'background', name: 'Sky Day', emoji: '☁️', unlock: null },
  { id: 'mint', slot: 'background', name: 'Mint Dots', emoji: '🍃', unlock: null },
  { id: 'night', slot: 'background', name: 'Moonlight', emoji: '🌙', unlock: { type: 'category', cat: 'unwind', value: 40 } },
  { id: 'burst', slot: 'background', name: 'Pink Pop', emoji: '💥', unlock: { type: 'xp', value: 250 } },
  { id: 'meadow', slot: 'background', name: 'Sunny Meadow', emoji: '🌻', unlock: { type: 'category', cat: 'move', value: 200 } },
  { id: 'sunset', slot: 'background', name: 'Calm Sunset', emoji: '🌅', unlock: { type: 'category', cat: 'calm', value: 200 } },
  { id: 'rainbowbg', slot: 'background', name: 'Rainbow Land', emoji: '🌈', unlock: { type: 'level', value: 6 } },
  { id: 'galaxy', slot: 'background', name: 'Galaxy Brain', emoji: '🪐', unlock: { type: 'streak', value: 30 } },
]

export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]))

export const fitsBody = (item: Item, body: Body) => !item.for || item.for === body
export const itemsFor = (body: Body) => ITEMS.filter((i) => fitsBody(i, body))

export const DEFAULT_AVATAR: AvatarConfig = {
  body: 'girl',
  skin: SKIN_TONES[1],
  hairColor: HAIR_COLORS[0],
  hair: 'long',
  top: 'tee',
  bottom: 'skirt',
  shoes: 'sneakers',
  accessory: 'none',
  background: 'sky',
}

const BODY_DEFAULTS: Record<Body, Partial<AvatarConfig>> = {
  girl: { hair: 'long', bottom: 'skirt' },
  boy: { hair: 'side', bottom: 'cargo' },
}

/** Switch body type, swapping out any items that don't fit the new body. */
export function withBody(config: AvatarConfig, body: Body): AvatarConfig {
  const next: AvatarConfig = { ...config, body }
  const slots: Slot[] = ['hair', 'top', 'bottom', 'shoes', 'accessory', 'background']
  for (const slot of slots) {
    const item = ITEM_BY_ID[next[slot]]
    if (!item || !fitsBody(item, body)) {
      const fallback = BODY_DEFAULTS[body][slot] ?? ITEMS.find((i) => i.slot === slot && !i.unlock && fitsBody(i, body))!.id
      next[slot] = fallback as string
    }
  }
  return next
}

export function describeUnlock(u: Unlock): string {
  switch (u.type) {
    case 'xp':
      return `Earn ${u.value.toLocaleString()} XP`
    case 'level':
      return `Reach level ${u.value} (${(50 * u.value * (u.value - 1)).toLocaleString()} XP)`
    case 'streak':
      return `${u.value}-day streak`
    case 'unwindStreak':
      return `${u.value}-night wind-down streak`
    case 'category':
      return `${u.value} ${{ move: 'Move', calm: 'Meditation', unwind: 'Wind-down' }[u.cat]} XP`
  }
}
