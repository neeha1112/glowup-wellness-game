# glowup — the wellness game

**A wellness game where every healthy action earns XP, builds your streak, and helps you level up and dress up your own character.**

Built for the Mosaic Wellness · CEO's Office Builder Round.

## Who it's for

People who *want* to look after their body and mind but struggle with consistency, and who lose their evenings to fast, high-stimulation scrolling right before bed. Habit trackers feel like homework to them; games don't.

## What it does

The whole app is one loop:

> **Choose what you need → quickly personalise → get a recommended session → earn XP → unlock items → glow up your avatar**

There's no generic "How are you feeling?" button on the home screen. Each part of the app asks its own questions, because what's useful to know depends on what you want to do.

- **Your own avatar.** Pick a girl or boy character at sign-up, then choose skin tone, hair, hair colour, outfit, shoes, extras and world. Each body type has its own wardrobe: boys get side parts, spiky hair, buzz cuts, quiffs, cargo pants, cords, a cap and a beard, and girls get long hair, bobs, space buns, ponytails and skirts. Most other items are shared. You can switch any time. It's hand-drawn in SVG, with thick outlines and flat colours, and it blinks, bounces and does the poses with you.
- **Move**: *understand your physical context, recommend movement, reward effort.* Six one-tap questions cover what you're wearing, where you are, whether people are around, how much time you have, your energy, and your space. Your answers place you on an **intensity ladder**: stretching → mobility → squats → lunges → jumping. Someone at the office, in workwear, with 5 minutes gets a desk-friendly session. Someone at home with 20 minutes and high energy gets a full cardio burst that climbs the ladder. The app explains each limit, and you can step easier or harder. **XP = minutes × 8 × intensity (×1 to ×2.2).**
- **Meditate**: *understand your emotional state, recommend a meditation, reward time.* Four questions: how you feel (calm, anxious, frustrated, overwhelmed or tired), what you want to feel after (calmer, focused, relaxed or reset), how long you have, and guided or quiet. A matching engine picks the best session, explains why, and offers two alternatives. For example, frustrated → *Let It Go* (a short tension release), and tired + quiet → *Quiet Sit*. **XP = 10 per minute**, so 15 minutes earns more than 3, but 3 still counts.
- **Wind down**: *keep friction low, build a calming sequence, reward consistency.* There's no questionnaire, just one tap: *Clear my head, Relax my body, Disconnect from my phone, Prepare for sleep,* or *Just give me something calming*, with a 5 or 15 minute toggle. The app builds a **sequence** of 3–5 parts, for example Do Not Disturb → breathing → gentle stretch → rain audio, which plays straight through. After that, a "Goodnight, phone down" screen; nothing suggests "one more". **XP = 6 per minute + 5 for every night in a row** (up to 7 nights), so showing up beats grinding.
- **Two streaks:** a daily wellness streak and a wind-down streak, with milestones at 3, 7, 14 and 30 days.
- **Levels** and **51 avatar items** (43–44 per body type). For example: 500 XP gets you *Chonky Boots*, a 7-day streak gets you the *Superstar Fit*, 1,000 XP gets you *Little Devil* horns, and 30 days unlocks the *Galaxy* world plus *Rocket Kicks*. Items are themed by category: Meditation earns cosy knits and headphones, Wind down earns PJs and bunny slippers, and Move earns jerseys and high-tops.
- **Progress dashboard:** total XP, level, both streaks, activities done, time spent, XP by category, a 4-week streak calendar, items unlocked, and progress toward the next rewards.
- A clean dark UI inspired by habit apps like Liftoff: bold type, bright full-round pills, and crossed-out items once you've done them. It still has game moments: confetti, level-up and unlock reveals, and synthesised sound effects.

## What makes it interesting

1. **Your wellness shows up on a character that belongs to you.** Rewards are visible things you wear, not abstract badges.
2. **Recommendations fit real life.** A workout that ignores your office shirt or your 3 free minutes won't get done. Asking the right few questions for each goal means the app suggests something you'll actually do.
3. **Each category rewards what matters for it.** Movement rewards effort, meditation rewards time, and winding down rewards consistency, so no one is pushed into a competitive bedtime.
4. **The bedtime mode is designed to end.** Most apps compete for your last hour of the night. Wind down builds one short sequence, then tells you to go to sleep.
5. **It respects your time and privacy.** There's no account and no backend. Progress lives on your device, and every sound is generated in the browser.

## Try it fast (for reviewers)

Open the app → create your character → do any activity. On any activity, tap the **1×** chip to switch to **10× demo speed**.
In **Me → Demo tools** you can add 6 past days of history (which unlocks streak rewards), jump to tomorrow, or add +250 XP to see levels and unlocks right away.

## Tech

- React 19 + TypeScript + Vite, with no UI libraries.
- All art is hand-written SVG: the avatar system (2 body types), 8 poses, 51 items, and Pip the penguin.
- Web Audio API for sound effects plus generated rain and ocean noise.
- `localStorage` persistence, deployed as a static site on GitHub Pages.

```bash
npm install
npm run dev
npm run build
```

`scripts/` contains Playwright scripts that drive the app in headless Edge to capture screenshots and the demo video.

## AI tools used

- **Cursor (agent mode, Claude)** helped turn the product brief into an architecture, write all the code (game logic, the SVG avatar and item art, screens, CSS), and debug runtime issues.
- **Playwright scripts written by the agent** drove the app end to end in a headless browser to check every screen visually, catch console errors, and record the demo video.
- Product direction and the visual references (a hand-drawn flat character style, plus Liftoff and Charmi for the UI) came from me; the AI handled implementation and iteration.
