/** Coins du cadre, en carrés de « pixels » plutôt qu'en gemmes : même vocabulaire que le dos de carte. */
const CORNERS = [
  { top: '8px', left: '8px' },
  { top: '8px', right: '8px' },
  { bottom: '8px', left: '8px' },
  { bottom: '8px', right: '8px' },
]

/**
 * Contour décoratif de l'écran Conquête : double liseré net et blocs d'angle, en écho au
 * cadre des illustrations. Purement visuel (absolu, pointer-events-none), il ne participe
 * pas au flux et ne peut donc pas rogner l'espace du plateau.
 */
export function ConquestScreenFrame() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-[6px]"
        style={{
          boxShadow:
            'inset 0 0 0 2px var(--color-cq-frame), inset 0 0 0 4px var(--color-bg), inset 0 0 0 6px var(--color-cq-ink)',
        }}
      />
      {CORNERS.map((pos, i) => (
        <span
          key={i}
          className="absolute"
          style={{ ...pos, width: 8, height: 8, backgroundColor: 'var(--color-cq-frame)' }}
        />
      ))}
    </div>
  )
}
