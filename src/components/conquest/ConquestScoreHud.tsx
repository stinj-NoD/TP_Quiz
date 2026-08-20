import { PLAYER_COLOR_VALUES } from '../../types/game.types'
import type { ConquestCard, ConquestPlayerConfig, ConquestSide } from '../../types/conquest.types'
import { ConquestDrawPile } from './ConquestDrawPile'
import { ConquestRoundPips } from './ConquestRoundPips'
import { SIDE_TINT } from './sideTint'

const SIDES: ConquestSide[] = ['A', 'B']

interface ConquestSidePileProps {
  remaining: number
  drawnCard: ConquestCard | null
  canDraw: boolean
}

interface ConquestScoreHudProps {
  players: Record<ConquestSide, ConquestPlayerConfig>
  activeSide: ConquestSide
  roundWins: Record<ConquestSide, number>
  piles: Record<ConquestSide, ConquestSidePileProps>
  onDraw: () => void
  onInspect: (side: ConquestSide) => void
}

/**
 * Barre de camp : identité (nom, couleur), score de série et pioche réunis par camp.
 *
 * La pioche vit ici plutôt que dans une rangée dédiée pour deux raisons : elle libère la
 * centaine de pixels verticaux qui faisait passer le bouton de mulligan sous la ligne de
 * flottaison, et elle supprime la double mention du nom (le HUD l'affichait, la légende
 * sous la pioche le répétait).
 */
export function ConquestScoreHud({ players, activeSide, roundWins, piles, onDraw, onInspect }: ConquestScoreHudProps) {
  return (
    <div className="flex gap-2">
      {SIDES.map((side) => {
        const player = players[side]
        const pile = piles[side]
        const active = side === activeSide
        const tint = SIDE_TINT[side]

        return (
          <div
            key={side}
            className="flex flex-1 items-center gap-2 rounded-[var(--radius-sm)] p-2 transition-[box-shadow]"
            style={{
              backgroundColor: 'var(--color-surface-raised)',
              // Un seul anneau : l'ancien liseré de chrome doublait celui du camp actif et
              // les deux se disputaient le même bord.
              boxShadow: active
                ? `inset 0 0 0 2px ${tint}, var(--shadow-cq-sm)`
                : 'inset 0 0 0 2px var(--color-cq-frame)',
            }}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 shrink-0"
                  style={{ backgroundColor: PLAYER_COLOR_VALUES[player.color] }}
                />
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{player.name}</span>
              </div>
              <ConquestRoundPips wins={roundWins[side]} />
            </div>

            <ConquestDrawPile
              label={player.name}
              remaining={pile.remaining}
              drawnCard={pile.drawnCard}
              canDraw={pile.canDraw}
              onDraw={onDraw}
              onInspect={() => onInspect(side)}
            />
          </div>
        )
      })}
    </div>
  )
}
