// Records a scripted walkthrough of the app to videos/*.webm using headless Edge.
// Usage: node scripts/demo-video.mjs [url]
import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'https://saarth09.github.io/glowup-wellness/'
const size = { width: 420, height: 860 }
const browser = await chromium.launch({ channel: 'msedge' })
const context = await browser.newContext({ viewport: size, recordVideo: { dir: 'videos/', size } })
const page = await context.newPage()
const wait = (ms) => page.waitForTimeout(ms)
const tap = async (locator, pause = 700) => {
  await locator.first().scrollIntoViewIfNeeded()
  await locator.first().click()
  await wait(pause)
}
const text = (t) => page.getByText(t, { exact: false })
const scroll = async (y, ms = 900) => {
  await page.mouse.wheel(0, y)
  await wait(ms)
}
const finishRewards = async () => {
  for (let i = 0; i < 10; i++) {
    const wear = page.locator('.rw-actions .btn-gold')
    const btn = page.locator('.rw-actions .btn')
    if (!(await btn.count())) return
    await wait(1600)
    await tap((await wear.count()) ? wear : btn, 500)
  }
}

await page.goto(url)
await page.evaluate(() => localStorage.clear())
await page.reload()
await wait(2200)

// Onboarding
await tap(text('Get started'))
await page.locator('input').pressSequentially('Neeharika', { delay: 90 })
await wait(500)
await tap(text('Continue'), 1000)
await tap(page.locator('.body-card').nth(1), 900)
await tap(page.locator('.body-card').nth(0), 700)
await tap(page.locator('.body-card').nth(1), 900)
await tap(text('Continue'), 1000)
await tap(page.locator('.swatch').nth(1), 400)
await tap(page.locator('.swatch').nth(10), 400)
await tap(page.locator('.item-tile').nth(1), 600)
await tap(page.locator('.slot-tab').nth(1), 500)
await tap(page.locator('.item-tile').nth(0), 500)
await tap(page.locator('.slot-tab').nth(4), 500)
await tap(page.locator('.item-tile').nth(1), 800)
await tap(page.locator('.slot-tab').nth(0), 500)
await tap(page.locator('.item-tile').nth(0), 600)
await tap(text('Looking good'), 2600)
await tap(text("Let's go"), 1800)

// Home tour
await scroll(420)
await scroll(420)
await scroll(-900, 700)

const answer = (label, pause = 650) => tap(page.getByRole('button', { name: label }), pause)

// Move: at the office in workwear -> desk-friendly; then at home with energy -> cardio
await tap(page.locator('.cat-pill').nth(0), 1200)
for (const a of ['Workwear', 'Office', 'Yes, people around', '5 minutes', 'High', 'Just my spot']) await answer(a)
await wait(1200)
await scroll(400, 1200)
await scroll(-600, 500)
await answer('Change answers', 900)
for (const a of ['Comfy clothes', 'Home', 'Nope, just me', '2 minutes', 'High', 'Plenty']) await answer(a)
await wait(1200)
await answer('Easier', 900)
await answer('Harder', 900)
await scroll(400, 900)
await tap(page.locator('.plan-cta .btn'), 1500)
await tap(page.locator('.speed'), 0)
await page.locator('.rewards').waitFor({ timeout: 60000 })
await finishRewards()

// Meditate: frustrated -> calmer
await wait(800)
await tap(page.locator('.cat-pill').nth(1), 1200)
for (const a of ['Frustrated', 'Calmer', '3 minutes', 'Guided']) await answer(a)
await wait(2200)
await tap(page.locator('.plan-cta .btn'), 1500)
await page.locator('.rewards').waitFor({ timeout: 60000 })
await finishRewards()

// Demo tools: fast-forward a week of history + XP
await tap(page.locator('.nav-btn').nth(3), 900)
await scroll(250)
await tap(text('Add 6 past days'), 700)
await tap(text('+250 XP'), 500)
await tap(text('+250 XP'), 500)
await tap(text('+250 XP'), 900)

// Closet: build the reference look
await tap(page.locator('.nav-btn').nth(1), 1500)
await tap(page.locator('.slot-tab').nth(3), 600)
await tap(page.locator('.item-tile').filter({ hasText: 'Chonky Boots' }), 900)
await scroll(-600, 300)
await tap(page.locator('.slot-tab').nth(4), 600)
await tap(page.locator('.item-tile').filter({ hasText: 'Blue Cap' }), 900)
await scroll(-600, 300)
await tap(page.locator('.slot-tab').nth(5), 600)
await tap(page.locator('.item-tile').filter({ hasText: 'Pink Pop' }), 900)
await scroll(-600, 300)
await tap(page.locator('.slot-tab').nth(1), 600)
await scroll(500, 1200)
await scroll(-600, 600)

// Progress dashboard
await tap(page.locator('.nav-btn').nth(2), 1200)
await scroll(450, 1000)
await scroll(450, 1000)
await scroll(450, 1200)

// Wind down: one choice -> a calming sequence -> goodnight
await tap(page.locator('.nav-btn').nth(0), 900)
await tap(page.locator('.cat-pill').nth(2), 2000)
await scroll(300, 1000)
await answer('Prepare for sleep', 2200)
await answer('Begin wind-down', 1500)
await page.locator('.rewards').waitFor({ timeout: 90000 })
await finishRewards()
await wait(3000)

await context.close()
await browser.close()
console.log('saved to videos/')

