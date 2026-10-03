import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'http://localhost:5180/'
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 420, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
const day = (o) => {
  const d = new Date()
  d.setDate(d.getDate() + o)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const log = [1, 2].map((i) => ({ id: `u${i}`, activityId: 'story', cat: 'unwind', xp: 40, minutes: 5, day: day(-i), ts: Date.now() - i * 864e5 }))
const avatar = { body: 'girl', skin: '#F7C9A6', hairColor: '#2B2118', hair: 'long', top: 'tee', bottom: 'skirt', shoes: 'sneakers', accessory: 'none', background: 'meadow' }
await page.goto(url)
await page.evaluate((s) => localStorage.setItem('glowup-state-v1', JSON.stringify(s)), { onboarded: true, name: 'Neeharika', avatar, log, seen: [], dayOffset: 0, demoSpeed: true, sound: false, unwindSwap: null })
await page.reload()
await page.locator('.cat-pill').nth(2).click()
await page.getByRole('button', { name: 'Just give me something calming' }).click()
await page.getByRole('button', { name: 'Begin wind-down' }).click()
for (let t = 0; t < 60; t++) {
  await page.waitForTimeout(1000)
  if (await page.locator('.rewards, .rw-sub').count()) break
}
await page.waitForTimeout(800)
await page.screenshot({ path: 'screenshots/42-unwind-reward.png' })
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('glowup-state-v1')).log.at(-1))
console.log('last entry', saved)
console.log('errors', errors)
await browser.close()
