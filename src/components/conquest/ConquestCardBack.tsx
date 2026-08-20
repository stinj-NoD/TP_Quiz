/**
 * Dos générique des cartes de Conquête, dessiné en SVG plutôt qu'en image : net à toutes
 * les tailles (de la vignette de pioche au plein écran), sans octet d'asset, et re-teinté
 * automatiquement par les tokens de la DA.
 *
 * Le motif reprend le vocabulaire des illustrations : tracé en marches d'escalier, aplats
 * francs, aucun dégradé flou. Le losange central fait écho aux quatre valeurs cardinales
 * d'une carte face visible.
 *
 * Le viewBox 40x60 (ratio 2:3, identique aux cartes) donne une grille de « pixels » d'une
 * unité : chaque forme s'aligne dessus, ce qui garantit des bords francs à l'échelle.
 */
export function ConquestCardBack() {
  return (
    <svg
      viewBox="0 0 40 60"
      className="h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="40" height="60" fill="var(--color-cq-ink-deep)" />

      {/* Double liseré en retrait, en marches : le cadre lavande des cartes face visible. */}
      <rect x="2" y="2" width="36" height="56" fill="none" stroke="var(--color-cq-frame)" strokeWidth="2" />
      <rect x="5" y="5" width="30" height="50" fill="none" stroke="var(--color-cq-ink)" strokeWidth="1" />

      {/* Losange central en escalier, construit par bandes d'une unité (pas de diagonale lissée). */}
      <g fill="var(--color-cq-frame)">
        <rect x="19" y="22" width="2" height="2" />
        <rect x="17" y="24" width="6" height="2" />
        <rect x="15" y="26" width="10" height="2" />
        <rect x="13" y="28" width="14" height="2" />
        <rect x="15" y="30" width="10" height="2" />
        <rect x="17" y="32" width="6" height="2" />
        <rect x="19" y="34" width="2" height="2" />
      </g>
      <g fill="var(--color-cq-ink)">
        <rect x="17" y="26" width="6" height="2" />
        <rect x="15" y="28" width="10" height="2" />
        <rect x="17" y="30" width="6" height="2" />
      </g>

      {/* Quatre marqueurs cardinaux, en écho aux valeurs nord/est/sud/ouest. */}
      <g fill="var(--color-cq-frame)">
        <rect x="19" y="9" width="2" height="2" />
        <rect x="19" y="47" width="2" height="2" />
        <rect x="9" y="28" width="2" height="2" />
        <rect x="29" y="28" width="2" height="2" />
      </g>
    </svg>
  )
}
