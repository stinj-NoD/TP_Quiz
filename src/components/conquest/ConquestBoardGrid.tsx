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
      className="grid grid-cols-3 gap-2 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-card)] ring-1 ring-[var(--color-border)]"
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
