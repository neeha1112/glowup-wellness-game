import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'http://localhost:5180/'
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 420, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const shot = (n, full = false) => page.screenshot({ path: `screenshots/${n}.png`, fullPage: full })
const tap = async (text) => {
  await page.getByRole('button', { name: text, exact: false }).first().click()
  await page.waitForTimeout(250)
}

const day = (o) => {
  const d = new Date()
  d.setDate(d.getDate() + o)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const log = []
for (let i = 3; i >= 1; i--) log.push({ id: `u${i}`, activityId: 'story', cat: 'unwind', xp: 40, minutes: 5, day: day(-i), ts: Date.now() - i * 864e5 })
const avatar = { body: 'boy', skin: '#E9AC80', hairColor: '#2B2118', hair: 'side', top: 'hoodie', bottom: 'cargo', shoes: 'hightops', accessory: 'none', background: 'meadow' }
const state = { onboarded: true, name: 'Neeharika', avatar, log, seen: [], dayOffset: 0, demoSpeed: true, sound: false, unwindSwap: null }

await page.goto(url)
await page.evaluate((s) => localStorage.setItem('glowup-state-v1', JSON.stringify(s)), state)
await page.reload()
await page.waitForTimeout(400)
await shot('30-home', true)

// Movement: office, workwear → desk-friendly
await page.locator('.cat-pill').nth(0).click()
await page.waitForTimeout(300)
await shot('31-move-q1')
for (const a of ['Workwear', 'Office', 'Yes, people around', '5 minutes', 'High', 'Just my spot']) await tap(a)
await page.waitForTimeout(300)
await shot('32-move-plan-office', true)
await tap('Change answers')
for (const a of ['Comfy clothes', 'Home', 'Nope, just me', '20 minutes', 'High', 'Plenty']) await tap(a)
await page.waitForTimeout(300)
await shot('33-move-plan-home', true)
await page.locator('.plan-cta .btn').click()
await page.waitForTimeout(1500)
await shot('34-move-player')

// Meditation
await page.goto(url)
await page.waitForTimeout(300)
await page.locator('.cat-pill').nth(1).click()
await page.waitForTimeout(300)
await shot('35-med-q1')
for (const a of ['Frustrated', 'Calmer', '3 minutes', 'Guided']) await tap(a)
await page.waitForTimeout(300)
await shot('36-med-plan', true)
await tap('Change answers')
for (const a of ['Tired', 'Relaxed', '15 minutes', 'Quiet']) await tap(a)
await page.waitForTimeout(300)
await shot('37-med-plan-quiet', true)

// Wind down
await page.goto(url)
await page.waitForTimeout(300)
await page.locator('.cat-pill').nth(2).click()
await page.waitForTimeout(400)
await shot('38-unwind-choice', true)
await tap('Prepare for sleep')
await shot('39-unwind-seq5', true)
await page.locator('.unwind-len button').nth(1).click().catch(() => {})
await tap('Choose something else')
await page.locator('.unwind-len button').nth(1).click()
await tap('Prepare for sleep')
await shot('40-unwind-seq15', true)
await tap('Begin wind-down')
await page.waitForTimeout(1500)
await shot('41-unwind-part1')
console.log('errors', errors)
await browser.close()
