import { CONQUEST_SERIES_TARGET_WINS } from '../../types/conquest.types'

interface ConquestRoundPipsProps {
  /** Manches déjà remportées par ce camp dans la série en cours. */
  wins: number
  size?: number
}

/**
 * Jauge de manches gagnées d'une série, en carrés pleins/vides plutôt qu'en gemmes :
 * le carré net est le vocabulaire du pixel art, et se lit mieux que le losange à 10px.
 * Partagé par le HUD de match et le récapitulatif de résultat, qui dupliquaient ce motif.
 */
export function ConquestRoundPips({ wins, size = 10 }: ConquestRoundPipsProps) {
  return (
    <div
      className="flex shrink-0 gap-1"
      role="img"
      aria-label={`${wins} manche${wins > 1 ? 's' : ''} gagnée${wins > 1 ? 's' : ''} sur ${CONQUEST_SERIES_TARGET_WINS}`}
    >
      {Array.from({ length: CONQUEST_SERIES_TARGET_WINS }, (_, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            // Manche gagnée : pastille pleine et claire. Manche restante : contour sombre,
            // sans remplissage. Distinguer par la couleur plutôt que par la seule opacité,
            // qui rendait les deux états presque identiques à cette taille.
            backgroundColor: i < wins ? 'var(--color-cq-parchment)' : 'transparent',
            boxShadow: i < wins ? 'none' : 'inset 0 0 0 2px var(--color-cq-frame)',
          }}
        />
      ))}
    </div>
  )
}
