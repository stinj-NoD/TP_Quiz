import type { ConquestCard, ConquestSide } from '../../types/conquest.types'

const SIDE_TINT: Record<ConquestSide, string> = {
  A: 'var(--color-player-blue)',
  B: 'var(--color-player-orange)',
}

interface ConquestCardFaceProps {
  card: ConquestCard
  /** Camp propriétaire si la carte est posée sur le plateau — absent pour une carte en main/pioche. */
  owner?: ConquestSide
  /** 'cell' remplit son conteneur (case du plateau) ; 'reveal' impose son propre gabarit (pioche/résumé). */
  size?: 'cell' | 'reveal'
}

export function ConquestCardFace({ card, owner, size = 'cell' }: ConquestCardFaceProps) {
  const isLegendary = card.rarity === 'legendaire'

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center rounded-[var(--radius-sm)] ${
        size === 'reveal' ? 'aspect-[5/7]' : ''
      }`}
      style={{
        background: isLegendary ? 'var(--gradient-primary)' : 'var(--color-surface-raised)',
        boxShadow: owner ? `inset 0 0 0 2px ${SIDE_TINT[owner]}` : 'inset 0 0 0 1px var(--color-border)',
      }}
    >
      {owner && (
        <span
          className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: SIDE_TINT[owner] }}
        >
          {owner}
        </span>
      )}
      <span className="truncate px-2 text-center text-[10px] font-semibold leading-tight text-[var(--color-text)]">
        {card.name}
      </span>
      <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[var(--color-accent-cyan)]">
        {card.values.nord}
      </span>
      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[var(--color-accent-cyan)]">
        {card.values.sud}
      </span>
      <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--color-accent-cyan)]">
        {card.values.ouest}
      </span>
      <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--color-accent-cyan)]">
        {card.values.est}
      </span>
    </div>
  )
}
