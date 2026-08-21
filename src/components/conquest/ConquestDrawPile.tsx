import { motion } from 'framer-motion'
import type { ConquestCard } from '../../types/conquest.types'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { ConquestCardBack } from './ConquestCardBack'
import { ConquestCardFace } from './ConquestCardFace'

interface ConquestDrawPileProps {
  /** Sert uniquement aux libellés d'accessibilité : le nom est affiché par le HUD qui héberge la pioche. */
  label: string
  remaining: number
  drawnCard: ConquestCard | null
  canDraw: boolean
  onDraw: () => void
  /** Une fois la carte révélée, le bouton bascule pour ouvrir la vue détaillée au lieu de piocher. */
  onInspect?: () => void
}

export function ConquestDrawPile({ label, remaining, drawnCard, canDraw, onDraw, onInspect }: ConquestDrawPileProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isFlipped = drawnCard !== null

  return (
    <div className="[perspective:1000px]">
      <motion.button
        type="button"
        onClick={isFlipped ? onInspect : onDraw}
        disabled={isFlipped ? !onInspect : !canDraw}
        aria-label={
          isFlipped
            ? `${label} : carte piochée, appuyez pour l'agrandir`
            : canDraw
              ? `${label} : piocher une carte (${remaining} restante${remaining > 1 ? 's' : ''})`
              : `${label} : ${remaining} carte${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}`
        }
        // Compacte sur mobile, où chaque pixel vertical compte ; un cran au-dessus dès que le
        // cadre s'élargit. La condition reprend celle de --app-max-width (theme.css) — un
        // simple breakpoint de largeur ferait grandir la pioche sur un écran large mais
        // court, où la hauteur manque justement. Un seul palier : au-delà, la pioche ne
        // gagne plus en lisibilité mais rogne la hauteur du plateau.
        className="relative aspect-[2/3] h-14 [@media(min-width:600px)_and_(min-height:800px)]:h-[4.5rem] [transform-style:preserve-3d] disabled:cursor-default"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        whileHover={isFlipped ? (onInspect ? { scale: 1.06 } : undefined) : canDraw ? { scale: 1.06 } : undefined}
        whileTap={isFlipped ? (onInspect ? { scale: 0.94 } : undefined) : canDraw ? { scale: 0.94 } : undefined}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-[var(--radius-sm)] [backface-visibility:hidden]"
          style={{ boxShadow: canDraw ? 'var(--shadow-cq-sm)' : undefined }}
        >
          <ConquestCardBack />
          {/* Compteur en pastille d'angle : lisible sur le motif, sans le masquer. */}
          <span
            className="absolute bottom-0 right-0 min-w-5 px-1 text-center text-xs font-bold leading-5 text-[var(--color-cq-ink-deep)]"
            style={{ backgroundColor: 'var(--color-cq-parchment)' }}
          >
            {remaining}
          </span>
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: 'rotateY(180deg)' }}>
          {drawnCard && <ConquestCardFace card={drawnCard} size="reveal" />}
        </div>
      </motion.button>
    </div>
  )
}
