import { Button } from '../ui/Button'

interface ConquestActionBarProps {
  canMulligan: boolean
  onMulligan: () => void
  canRedeal: boolean
  onRedeal: () => void
}

/**
 * Zone d'actions ancrée en bas de l'écran de match, hors du flux du plateau.
 *
 * Les actions vivaient auparavant sous le plateau, ce qui les envoyait sous la ligne de
 * flottaison : le contenu réclamait ~843px pour ~776px disponibles, et davantage encore
 * en PWA installée à encoche. Ancrer la barre garantit qu'une action proposée est
 * toujours atteignable, sans défilement, pendant le tour du joueur.
 *
 * La hauteur est réservée en permanence pour que le plateau ne se redimensionne pas à
 * chaque apparition ou disparition d'un bouton.
 */
export function ConquestActionBar({ canMulligan, onMulligan, canRedeal, onRedeal }: ConquestActionBarProps) {
  return (
    <div className="flex h-14 shrink-0 items-center justify-center gap-2 px-3">
      {canRedeal && (
        <Button variant="secondary" accent="conquest" size="md" onClick={onRedeal}>
          Rebattre les cartes
        </Button>
      )}
      {canMulligan && (
        <Button
          variant="secondary"
          accent="conquest"
          size="md"
          onClick={onMulligan}
          aria-label="Refuser cette carte et en piocher une autre — une seule fois par manche"
        >
          Refuser cette carte
        </Button>
      )}
    </div>
  )
}
