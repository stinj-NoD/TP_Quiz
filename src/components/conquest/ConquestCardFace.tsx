import { useState } from 'react'
import type { ConquestCard, ConquestSide } from '../../types/conquest.types'
import { CONQUEST_CARD_IMAGES } from '../../data/conquest'
import { SIDE_TINT } from './sideTint'

interface ConquestCardFaceProps {
  card: ConquestCard
  /** Camp propriétaire si la carte est posée sur le plateau — absent pour une carte en main/pioche. */
  owner?: ConquestSide
  /** 'cell' remplit son conteneur (case du plateau) ; 'reveal' impose son propre gabarit (pioche/résumé). */
  size?: 'cell' | 'reveal'
}

/** Une valeur du bandeau, positionnée sur la grille 3x3 de la mini-boussole. */
function ConquestCompassValue({ value, area }: { value: number; area: string }) {
  return (
    <span
      className="flex items-center justify-center text-[11px] font-bold text-[var(--color-accent-cyan)]"
      style={{ gridArea: area }}
    >
      {value}
    </span>
  )
}

/**
 * Les illustrations sont des cartes déjà finies (cadre, nom et 4 valeurs imprimés dessus, comme une
 * vraie carte physique) : on les affiche donc pleines et non recadrées (ratio natif 2:3), sans rien
 * superposer par-dessus — superposer notre propre bandeau de valeurs entrerait en conflit visuel avec
 * les chiffres déjà présents sur l'image.
 *
 * Le repli texte (nom + boussole de valeurs) couvre deux cas : une carte sans illustration associée,
 * et une illustration qui échoue à se charger (hors ligne avant mise en cache, fichier corrompu).
 * Ce second cas impose une balise <img> plutôt qu'un background CSS : une image de fond qui échoue
 * ne remonte aucun événement, et laissait donc une carte vide, sans nom ni valeurs.
 */
export function ConquestCardFace({ card, owner, size = 'cell' }: ConquestCardFaceProps) {
  const isTopTier = card.rarity === 'S'
  const imageUrl = CONQUEST_CARD_IMAGES[card.id]
  const [imageFailed, setImageFailed] = useState(false)

  const showImage = imageUrl !== undefined && !imageFailed

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-[var(--radius-sm)] ${
        size === 'reveal' ? 'aspect-[2/3]' : ''
      }`}
      style={{
        background: showImage ? undefined : isTopTier ? 'var(--gradient-cq)' : 'var(--color-surface-raised)',
        boxShadow: owner ? `inset 0 0 0 2px ${SIDE_TINT[owner]}` : 'inset 0 0 0 1px var(--color-border)',
      }}
    >
      {showImage && (
        <img
          src={imageUrl}
          alt={card.name}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-contain"
        />
      )}
      {owner && (
        <span
          className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: SIDE_TINT[owner] }}
        >
          {owner}
        </span>
      )}
      {!showImage && (
        <div className="flex h-full w-full flex-col">
          <div className="flex flex-1 items-center justify-center px-2">
            <span className="truncate text-center text-[10px] font-semibold leading-tight text-[var(--color-text)]">
              {card.name}
            </span>
          </div>
          <div
            className="grid h-7 shrink-0 bg-[var(--color-surface)]"
            style={{
              gridTemplateAreas: '"a n b" "o . e" "c s d"',
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr',
            }}
          >
            <ConquestCompassValue value={card.values.nord} area="n" />
            <ConquestCompassValue value={card.values.est} area="e" />
            <ConquestCompassValue value={card.values.sud} area="s" />
            <ConquestCompassValue value={card.values.ouest} area="o" />
          </div>
        </div>
      )}
    </div>
  )
}
