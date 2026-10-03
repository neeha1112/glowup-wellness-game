import { Avatar } from '../components/Avatar'
import { Customizer } from '../components/Customizer'
import { itemsFor } from '../data/items'
import { unlockedIds } from '../lib/game'
import type { Game } from '../lib/store'
import { TopBar } from './Home'

export function Closet({ game }: { game: Game }) {
  const { state, stats, update } = game
  const body = state.avatar.body
  const unlocked = unlockedIds(stats, body)

  return (
    <div className="screen closet">
      <TopBar game={game} />
      <h1 className="display">Closet</h1>
      <p className="lede">
        {unlocked.length} of {itemsFor(body).length} items unlocked
      </p>
      <div className="closet-stage">
        <Avatar config={state.avatar} pose="wave" />
      </div>
      <Customizer config={state.avatar} onChange={(avatar) => update({ avatar })} stats={stats} seen={state.seen} />
    </div>
  )
}
