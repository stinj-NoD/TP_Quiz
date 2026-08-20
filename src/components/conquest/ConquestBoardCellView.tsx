import type { ConquestBoardCell } from '../../types/conquest.types'
import { ConquestCardFace } from './ConquestCardFace'

interface ConquestBoardCellViewProps {
  position: number
  cell: ConquestBoardCell | null
  clickable: boolean
  onPlace: (position: number) => void
}

export function ConquestBoardCellView({ position, cell, clickable, onPlace }: ConquestBoardCellViewProps) {
  const label = cell
    ? `Case ${position + 1}, carte ${cell.card.name}, camp ${cell.ownerId}`
    : clickable
      ? `Case ${position + 1}, vide, poser la carte piochée ici`
      : `Case ${position + 1}, vide`

  return (
    <button
      type="button"
      onClick={() => onPlace(position)}
      disabled={!clickable}
      aria-label={label}
      // Plus d'aspect-ratio ici : c'est la grille qui impose désormais des rangées égales
      // (grid-rows-3), sans quoi les cases tenteraient de forcer leur propre hauteur.
      className="min-h-0 rounded-[var(--radius-sm)] p-1 transition-[transform,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-light)] disabled:cursor-default enabled:active:scale-95"
      style={{
        backgroundColor: cell ? 'transparent' : 'var(--color-bg-alt)',
        boxShadow: clickable
          ? 'inset 0 0 0 2px var(--color-accent-cyan)'
          : 'inset 0 0 0 2px var(--color-cq-frame)',
      }}
    >
      {cell ? (
        <ConquestCardFace card={cell.card} owner={cell.ownerId} />
      ) : (
        <div
          className="h-full w-full"
          style={{ backgroundColor: 'var(--color-surface-raised)' }}
        />
      )}
    </button>
  )
}
