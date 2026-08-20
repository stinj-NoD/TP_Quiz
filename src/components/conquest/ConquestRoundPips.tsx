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
            // Lavande sur fond sombre : l'encre violette du token `ink` est faite pour les
            // fonds clairs des cartes et disparaîtrait complètement sur la surface du HUD.
            backgroundColor: i < wins ? 'var(--color-cq-frame)' : 'transparent',
            boxShadow: 'inset 0 0 0 2px var(--color-cq-frame)',
            opacity: i < wins ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  )
}
