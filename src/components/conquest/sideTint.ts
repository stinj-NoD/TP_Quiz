import type { ConquestSide } from '../../types/conquest.types'

/** Teinte d'identité de camp — cohérente entre le badge de propriétaire sur une carte posée
 *  (ConquestCardFace) et le HUD de score (ConquestScoreHud). */
export const SIDE_TINT: Record<ConquestSide, string> = {
  A: 'var(--color-player-blue)',
  B: 'var(--color-player-orange)',
}
