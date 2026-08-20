import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { ConquestCardBack } from './ConquestCardBack'

/** Nombre de cartes mises en scène — sans rapport avec la taille réelle des piles : c'est du décor. */
const CARD_COUNT = 10
const RIFFLE_CYCLES = 3

interface ConquestShuffleOverlayProps {
  /** Change de valeur à chaque nouvelle donne : relance la séquence. */
  dealKey: number
  onDone: () => void
}

/**
 * Mise en scène du battage des cartes au début d'une manche.
 *
 * Purement décoratif : la manche est déjà distribuée en mémoire quand l'animation démarre,
 * et le joueur ne voit jamais sa main — il n'y a donc aucune information à révéler ni à
 * préserver ici. L'overlay ne fait que retarder l'affichage du plateau.
 *
 * Deux garde-fous : la séquence est escamotable d'un appui (2,5 s à chaque manche d'un
 * best-of-3 devient vite pesant), et réduite à néant si l'utilisateur a demandé moins
 * d'animations.
 */
export function ConquestShuffleOverlay({ dealKey, onDone }: ConquestShuffleOverlayProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [phase, setPhase] = useState<'stack' | 'riffle' | 'deal'>('stack')

  // `onDone` est recréé à chaque rendu du parent ; le garder hors des dépendances via une
  // ref évite de relancer la séquence en boucle, tout en appelant toujours la version à jour.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (prefersReducedMotion) {
      onDoneRef.current()
      return
    }

    setPhase('stack')
    const toRiffle = setTimeout(() => setPhase('riffle'), 450)
    const toDeal = setTimeout(() => setPhase('deal'), 1750)
    const finish = setTimeout(() => onDoneRef.current(), 2500)

    return () => {
      clearTimeout(toRiffle)
      clearTimeout(toDeal)
      clearTimeout(finish)
    }
  }, [dealKey, prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-40 flex items-center justify-center bg-[var(--color-bg)]/95"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={onDone}
        role="button"
        tabIndex={0}
        aria-label="Distribution des cartes, appuyez pour passer"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onDone()
        }}
      >
        <div className="relative h-40 w-28 [perspective:1000px]">
          {Array.from({ length: CARD_COUNT }, (_, i) => {
            // Deux paquets qui s'interclassent : les pairs partent à gauche, les impairs à droite.
            const toLeft = i % 2 === 0
            const rifflePhase = (i % RIFFLE_CYCLES) / RIFFLE_CYCLES

            const target =
              phase === 'stack'
                ? { x: 0, y: i * -1.5, rotate: (i - CARD_COUNT / 2) * 1.2, opacity: 1 }
                : phase === 'riffle'
                  ? {
                      x: toLeft ? -46 : 46,
                      y: (i - CARD_COUNT / 2) * 5,
                      rotate: toLeft ? -10 - rifflePhase * 6 : 10 + rifflePhase * 6,
                      opacity: 1,
                    }
                  : // Distribution : les cartes filent vers les deux pioches, en haut de l'écran.
                    { x: toLeft ? -70 : 70, y: -180, rotate: 0, opacity: 0 }

            return (
              <motion.div
                key={i}
                className="absolute inset-0 overflow-hidden rounded-[var(--radius-sm)]"
                style={{ zIndex: i, boxShadow: 'var(--shadow-cq-sm)' }}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                animate={target}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 24,
                  delay: phase === 'deal' ? i * 0.045 : i * 0.015,
                }}
              >
                <ConquestCardBack />
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
