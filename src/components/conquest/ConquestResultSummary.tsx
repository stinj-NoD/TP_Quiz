import { Card } from '../ui/Card'
import { PLAYER_COLOR_VALUES } from '../../types/game.types'
import type { ConquestOutcome, ConquestPlayerResult, ConquestSide } from '../../types/conquest.types'

const SIDES: ConquestSide[] = ['A', 'B']

interface ConquestResultSummaryProps {
  players: Record<ConquestSide, ConquestPlayerResult>
  outcome: ConquestOutcome
}

export function ConquestResultSummary({ players, outcome }: ConquestResultSummaryProps) {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2.5">
      {SIDES.map((side) => {
        const player = players[side]
        const isWinner = outcome === side
        return (
          <Card key={side} className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{
                backgroundColor: PLAYER_COLOR_VALUES[player.color],
                boxShadow: `0 0 10px ${PLAYER_COLOR_VALUES[player.color]}`,
              }}
            >
              {side}
            </span>
            <span className="flex-1 text-left text-sm font-semibold">
              {player.name}
              {isWinner && ' · Vainqueur'}
            </span>
            <span className="text-lg font-bold font-[var(--font-display)] text-[var(--color-primary-light)]">
              {player.cardsControlled} cartes
            </span>
          </Card>
        )
      })}
    </div>
  )
}
