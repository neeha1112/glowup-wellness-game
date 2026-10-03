import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'http://localhost:5180/'
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 420, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const shot = (n, full = false) => page.screenshot({ path: `screenshots/${n}.png`, fullPage: full })

const day = (o) => {
  const d = new Date()
  d.setDate(d.getDate() + o)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const log = []
let n = 0
for (let i = 9; i >= 1; i--) {
  for (const [cat, a] of [['move', 'hiit'], ['calm', 'box'], ['unwind', 'story']]) {
    log.push({ id: `x${n++}`, activityId: a, cat, xp: 70, minutes: 5, day: day(-i), ts: Date.now() - i * 864e5 })
  }
}
const avatars = [
  { body: 'boy', skin: '#E9AC80', hairColor: '#2B2118', hair: 'side', top: 'hoodie', bottom: 'cargo', shoes: 'hightops', accessory: 'none', background: 'meadow' },
  { body: 'boy', skin: '#8F5A32', hairColor: '#2B2118', hair: 'spiky', top: 'jersey', bottom: 'shorts', shoes: 'sneakers', accessory: 'cap', background: 'burst' },
  { body: 'boy', skin: '#F7C9A6', hairColor: '#A9532B', hair: 'quiff', top: 'sweater', bottom: 'cords', shoes: 'loafers', accessory: 'beard', background: 'sunset' },
  { body: 'boy', skin: '#5E3B22', hairColor: '#2B2118', hair: 'buzz', top: 'tank', bottom: 'joggers', shoes: 'boots', accessory: 'glasses', background: 'sky' },
  { body: 'girl', skin: '#F7C9A6', hairColor: '#2B2118', hair: 'long', top: 'tee', bottom: 'skirt', shoes: 'boots', accessory: 'horns', background: 'burst' },
  { body: 'girl', skin: '#C98A55', hairColor: '#8C8FFF', hair: 'buns', top: 'startop', bottom: 'leggings', shoes: 'rocket', accessory: 'crown', background: 'galaxy' },
  { body: 'boy', skin: '#FFE0CC', hairColor: '#EBC57C', hair: 'curly', top: 'pj', bottom: 'pjpants', shoes: 'slippers', accessory: 'headphones', background: 'night' },
  { body: 'boy', skin: '#C98A55', hairColor: '#5B3A29', hair: 'short', top: 'startop', bottom: 'leggings', shoes: 'rocket', accessory: 'crown', background: 'galaxy' },
]
const state = (avatar, extra = {}) => ({
  onboarded: true, name: 'Neeharika', avatar, log, seen: [], dayOffset: 0, demoSpeed: true, sound: false, unwindSwap: null, ...extra,
})

await page.goto(url)
for (let i = 0; i < avatars.length; i++) {
  await page.evaluate((s) => localStorage.setItem('glowup-state-v1', JSON.stringify(s)), state(avatars[i]))
  await page.reload()
  await page.waitForTimeout(300)
  await page.locator('.hero-avatar').screenshot({ path: `screenshots/av-${i}.png` })
}
await page.evaluate((s) => localStorage.setItem('glowup-state-v1', JSON.stringify(s)), state(avatars[1]))
await page.reload()
await page.waitForTimeout(400)
await shot('20-home-adv')
await page.locator('.nav-btn').nth(1).click()
await page.waitForTimeout(400)
await shot('21-closet')
await page.getByText('Tops', { exact: true }).click()
await page.waitForTimeout(300)
await shot('21b-closet-tops', true)
await page.locator('.nav-btn').nth(2).click()
await page.waitForTimeout(400)
await shot('22-progress', true)
await page.locator('.nav-btn').nth(3).click()
await page.waitForTimeout(400)
await shot('23-me', true)
console.log('errors', errors)
await browser.close()

