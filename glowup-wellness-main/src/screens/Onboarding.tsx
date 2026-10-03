import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Customizer } from '../components/Customizer'
import { Button, Pip } from '../components/ui'
import { HAIR_COLORS, SKIN_TONES, itemsFor, withBody, type AvatarConfig, type Body, type Slot } from '../data/items'
import type { Game } from '../lib/store'

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

function shuffle(c: AvatarConfig): AvatarConfig {
  const free = (s: Slot) => itemsFor(c.body).filter((i) => i.slot === s && !i.unlock).map((i) => i.id)
  return {
    ...c,
    skin: pick(SKIN_TONES),
    hairColor: pick(HAIR_COLORS),
    hair: pick(free('hair')),
    top: pick(free('top')),
    bottom: pick(free('bottom')),
    shoes: pick(free('shoes')),
    accessory: pick(free('accessory')),
    background: pick(free('background')),
  }
}

const STEPS = 5

export function Onboarding({ game }: { game: Game }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<AvatarConfig>(game.state.avatar)

  const finish = () => game.update({ onboarded: true, name: name.trim() || 'Friend', avatar })
  const chooseBody = (b: Body) => setAvatar((a) => withBody(a, b))

  return (
    <div className={`onboarding ${step === 0 ? 'ob-hero' : ''}`}>
      <div className="ob-progress">
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className={i <= step ? 'on' : ''} />
        ))}
      </div>

      {step === 0 && (
        <div className="ob-step">
          <h1 className="ob-headline">
            Level up
            <br />
            your real
            <br />
            life with
            <br />
            glowup
          </h1>
          <div className="ob-stage">
            <div className="burst">Hello!</div>
            <div className="bubble">Let's start!</div>
            <span className="dot-deco d1" />
            <span className="dot-deco d2" />
            <span className="dot-deco d3" />
            <Pip mood="wave" size={170} />
          </div>
          <p className="ob-sub">Move, breathe and wind down to earn XP, keep streaks and dress up a character that's all yours.</p>
          <div className="ob-actions">
            <Button block onClick={() => setStep(1)}>Get started</Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="ob-step">
          <h2 className="ob-title">What should we call you?</h2>
          <input
            className="text-input"
            autoFocus
            maxLength={16}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
          />
          <div className="ob-actions">
            <Button block disabled={!name.trim()} onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="ob-step">
          <h2 className="ob-title">Pick your character</h2>
          <p className="ob-sub">You can switch any time in the closet.</p>
          <div className="body-pick">
            {(['girl', 'boy'] as Body[]).map((b) => (
              <button key={b} className={`body-card ${avatar.body === b ? 'active' : ''}`} onClick={() => chooseBody(b)}>
                <Avatar config={withBody(avatar, b)} pose="wave" />
                <span>{b === 'girl' ? 'Girl' : 'Boy'}</span>
              </button>
            ))}
          </div>
          <div className="ob-actions">
            <Button block onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ob-step">
          <h2 className="ob-title">Make it yours</h2>
          <div className="ob-avatar">
            <Avatar config={avatar} pose="wave" />
            <button className="shuffle" onClick={() => setAvatar(shuffle(avatar))} aria-label="Randomise">
              Shuffle
            </button>
          </div>
          <Customizer config={avatar} onChange={setAvatar} />
          <div className="ob-actions sticky">
            <Button block onClick={() => setStep(4)}>Looking good</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="ob-step">
          <h2 className="ob-title">How it works, {name.trim() || 'friend'}</h2>
          <div className="pill-list">
            {[
              ['Pick Move, Meditate or Wind down', '#D4F06B'],
              ['Answer a few quick questions', '#A9C9F2'],
              ['Get a session that fits right now', '#EDEB5E'],
              ['Earn XP for effort, time and streaks', '#F2894A'],
              ['Unlock outfits for your character', '#F2A3CB'],
            ].map(([t, c], i) => (
              <div key={i} className="pill loop-pill" style={{ background: c, animationDelay: `${i * 0.08}s` }}>
                <span className="pill-name">{t}</span>
                <span className="pill-num">{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="ob-actions">
            <Button block onClick={finish}>Let's go</Button>
          </div>
        </div>
      )}
    </div>
  )
}
