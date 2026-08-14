import type { Player } from '../../types/game.types'
import { PLAYER_COLOR_VALUES } from '../../types/game.types'
import { WedgeTracker } from './WedgeTracker'

interface PlayerHUDProps {
  players: Player[]
  currentPlayerIndex: number
}

export function PlayerHUD({ players, currentPlayerIndex }: PlayerHUDProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-2">
      {players.map((player, index) => {
        const active = index === currentPlayerIndex
        return (
          <div
            key={player.id}
            className={`flex shrink-0 flex-col gap-1.5 rounded-[var(--radius-md)] px-3 py-2 transition-[background-color,box-shadow] ${
              active
                ? 'bg-[var(--color-surface-raised)] ring-1 ring-[var(--color-primary-light)] shadow-[var(--glow-sm)]'
                : 'bg-[var(--color-surface)]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: PLAYER_COLOR_VALUES[player.color],
                  boxShadow: `0 0 6px ${PLAYER_COLOR_VALUES[player.color]}`,
                }}
              />
              <span className="text-xs font-semibold">{player.name}</span>
            </div>
            <WedgeTracker wedges={player.wedges} size={8} />
          </div>
        )
      })}
    </div>
  )
}
