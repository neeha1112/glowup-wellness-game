import { useState } from 'react'
import { Button, Icon, PALETTE } from '../components/ui'
import { CATEGORY_INFO, INTENSITY_MULT, MEDITATE_XP_PER_MIN, type Activity } from '../data/activities'
import {
  LADDER,
  MEDITATE_QUESTIONS,
  MOVE_QUESTIONS,
  buildMoveSession,
  recommendMeditation,
  type MeditateAnswers,
  type MoveAnswers,
  type Question,
} from '../data/recommend'
import type { Game } from '../lib/store'

type Answers = Record<string, string>

function Quiz({ questions, color, title, previous, onBack, onDone }: { questions: Question[]; color: string; title: string; previous?: Answers; onBack: () => void; onDone: (a: Answers) => void }) {
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const q = questions[i]
  const choose = (id: string) => {
    const next = { ...answers, [q.id]: id }
    setAnswers(next)
    if (i + 1 < questions.length) setTimeout(() => setI(i + 1), 120)
    else onDone(next)
  }
  return (
    <div className="screen quiz">
      <header className="page-head">
        <button className="icon-btn" onClick={() => (i ? setI(i - 1) : onBack())} aria-label="Back">
          <Icon name="back" />
        </button>
        <div className="quiz-progress">
          <i style={{ width: `${(i / questions.length) * 100}%`, background: color }} />
        </div>
        <span className="quiz-count">
          {i + 1}/{questions.length}
        </span>
      </header>
      <small className="eyebrow" style={{ color }}>
        {title}
      </small>
      <h1 key={q.id} className="display quiz-q">
        {q.q}
      </h1>
      <div className="pill-list">
        {q.options.map((o, k) => {
          const chosen = answers[q.id] === o.id
          const wasLast = !answers[q.id] && previous?.[q.id] === o.id
          return (
            <button
              key={o.id}
              className={`pill opt-pill ${chosen ? 'chosen' : ''} ${wasLast ? 'last' : ''}`}
              style={{ background: PALETTE[(k * 3 + i) % PALETTE.length] }}
              onClick={() => choose(o.id)}
            >
              <span className="pill-text">
                <span className="pill-name">{o.label}</span>
                {o.sub && <small>{o.sub}</small>}
              </span>
              <span className="pill-num">{chosen ? <Icon name="check" /> : wasLast ? <small>last time</small> : null}</span>
            </button>
          )
        })}
      </div>
      {i === 0 && previous && (
        <button className="link-btn" onClick={() => onDone(previous)}>
          Same as last time
        </button>
      )}
    </div>
  )
}

interface FlowProps {
  game: Game
  onBack: () => void
  onStart: (a: Activity, minutes: number) => void
}

export function MoveFlow({ game, onBack, onStart }: FlowProps) {
  const info = CATEGORY_INFO.move
  const [answers, setAnswers] = useState<MoveAnswers | null>(null)
  const [intensity, setIntensity] = useState<number | undefined>()

  if (!answers)
    return (
      <Quiz
        questions={MOVE_QUESTIONS}
        color={info.color}
        title="Move · quick check-in"
        previous={game.state.lastMove}
        onBack={onBack}
        onDone={(a) => {
          setAnswers(a as MoveAnswers)
          setIntensity(undefined)
          game.update({ lastMove: a as MoveAnswers })
        }}
      />
    )

  const plan = buildMoveSession(answers, intensity)
  const { activity } = plan
  const steps = activity.steps ?? []
  return (
    <div className="screen plan">
      <header className="page-head">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <Icon name="back" />
        </button>
        <span className="stat-pill">
          <b>{game.stats.catXp.move}</b> Move XP
        </span>
      </header>
      <small className="eyebrow">Your session</small>
      <h1 className="display" style={{ color: info.color }}>
        {activity.title}
      </h1>

      <div className="ladder">
        {LADDER.map((rung, k) => {
          const n = k + 1
          const state = n <= plan.intensity ? 'on' : n <= plan.maxIntensity ? 'open' : 'off'
          return (
            <div key={rung} className={`rung ${state}`}>
              <i style={{ height: `${28 + k * 14}px` }} />
              <small>{rung}</small>
            </div>
          )
        })}
      </div>

      <ul className="reasons">
        {plan.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <div className="adjust">
        <button className="chip" disabled={plan.intensity <= 1} onClick={() => setIntensity(plan.intensity - 1)}>
          Easier
        </button>
        <span>
          Intensity {plan.intensity}/5 · ×{INTENSITY_MULT[plan.intensity]} XP
        </span>
        <button className="chip" disabled={plan.intensity >= plan.maxIntensity} onClick={() => setIntensity(plan.intensity + 1)}>
          Harder
        </button>
      </div>

      <div className="list-head">
        <b>What you'll do</b>
        <small>
          {steps.length} moves · {plan.minutes} min
        </small>
      </div>
      <ol className="plan-steps">
        {steps.slice(0, 6).map((s, k) => (
          <li key={k}>{s.text}</li>
        ))}
        {steps.length > 6 && <li className="more">+ {steps.length - 6} more</li>}
      </ol>

      <div className="plan-cta">
        <Button block variant="green" onClick={() => onStart(activity, plan.minutes)}>
          Start · +{activity.xp} XP
        </Button>
        <p className="tiny-note">Harder or longer sessions earn more XP.</p>
        <button className="link-btn" onClick={() => setAnswers(null)}>
          Change answers
        </button>
      </div>
    </div>
  )
}

export function MeditateFlow({ game, onBack, onStart }: FlowProps) {
  const info = CATEGORY_INFO.calm
  const [answers, setAnswers] = useState<MeditateAnswers | null>(null)
  const [choice, setChoice] = useState<string | null>(null)

  if (!answers)
    return (
      <Quiz
        questions={MEDITATE_QUESTIONS}
        color={info.color}
        title="Meditate · quick check-in"
        previous={game.state.lastMeditate}
        onBack={onBack}
        onDone={(a) => {
          setAnswers(a as MeditateAnswers)
          setChoice(null)
          game.update({ lastMeditate: a as MeditateAnswers })
        }}
      />
    )

  const plan = recommendMeditation(answers)
  const options = [plan.activity, ...plan.alternatives]
  const pick = options.find((o) => o.id === choice) ?? plan.activity
  return (
    <div className="screen plan">
      <header className="page-head">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <Icon name="back" />
        </button>
        <span className="stat-pill">
          <b>{game.stats.catXp.calm}</b> Meditation XP
        </span>
      </header>
      <small className="eyebrow">{pick === plan.activity ? 'Recommended for you' : 'Your pick'}</small>
      <h1 className="display" style={{ color: info.color }}>
        {pick.title}
      </h1>
      <p className="lede">{pick.blurb}</p>

      <div className="why-card">
        <small className="eyebrow dark">Why this</small>
        <p>{pick === plan.activity ? plan.why : pick.reason}</p>
        <div className="chips">
          <span className="chip">{plan.minutes} min</span>
          <span className="chip">{answers.style === 'quiet' ? 'Quiet' : 'Guided'}</span>
          <span className="chip chip-xp">+{pick.xp} XP</span>
        </div>
      </div>

      <div className="plan-cta">
        <Button block variant="blue" onClick={() => onStart(pick, plan.minutes)}>
          Start meditation
        </Button>
        <p className="tiny-note">
          {MEDITATE_XP_PER_MIN} XP per minute. Longer sits earn more, short ones still count.
        </p>
      </div>

      <div className="list-head">
        <b>Or try</b>
        <small>Same {plan.minutes} min</small>
      </div>
      <div className="pill-list">
        {options
          .filter((o) => o.id !== pick.id)
          .map((o, k) => (
            <button key={o.id} className="pill act-pill" style={{ background: PALETTE[(k * 2 + 3) % PALETTE.length] }} onClick={() => setChoice(o.id)}>
              <span className="pill-text">
                <span className="pill-name">{o.title}</span>
                <small>{o.blurb}</small>
              </span>
              <span className="pill-num">+{o.xp}</span>
            </button>
          ))}
      </div>
      <button className="link-btn" onClick={() => setAnswers(null)}>
        Change answers
      </button>
    </div>
  )
}
