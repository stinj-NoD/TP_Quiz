import type { ConquestBoard } from '../../types/conquest.types'
import { ConquestBoardCellView } from './ConquestBoardCellView'

interface ConquestBoardGridProps {
  board: ConquestBoard
  interactive: boolean
  onPlace: (position: number) => void
}

export function ConquestBoardGrid({ board, interactive, onPlace }: ConquestBoardGridProps) {
  return (
    <div
      role="grid"
      aria-label="Plateau de Conquête 3x3"
      // Le plateau se cale sur la largeur et en déduit sa hauteur via le ratio des cartes
      // (trois cases 2:3 côte à côte forment un ensemble en 2:3). `max-h-full` sert de
      // garde-fou : en paysage ou sur un écran court, il clampe plutôt que de déborder.
      className="grid aspect-[2/3] max-h-full w-full grid-cols-3 grid-rows-3 gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-surface)] p-1.5 ring-2 ring-[var(--color-cq-frame)]"
      style={{ boxShadow: 'var(--shadow-cq)' }}
    >
      {board.map((cell, position) => (
        <ConquestBoardCellView
          key={position}
          position={position}
          cell={cell}
          clickable={interactive && cell === null}
          onPlace={onPlace}
        />
      ))}
    </div>
  )
}
