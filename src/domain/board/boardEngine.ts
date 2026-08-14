import { BOARD_RING, CENTER_CELL, RADIUS_CELL_INDICES } from '../../data/board/boardLayout'
import type { Player } from '../../types/game.types'

const RING_SIZE = BOARD_RING.length

export function hasAllWedges(player: Player): boolean {
  return Object.values(player.wedges).every(Boolean)
}

/**
 * Un joueur qui a les 6 camemberts et qui s'arrête exactement sur une case
 * "wedge" (point de rayon) peut choisir d'entrer au centre plutôt que de
 * continuer sur l'anneau, comme dans le vrai jeu.
 */
export function canEnterCenter(player: Player, landedRingIndex: number): boolean {
  return hasAllWedges(player) && RADIUS_CELL_INDICES.includes(landedRingIndex)
}

export interface MoveResult {
  ringIndex: number
  enteredCenterEligible: boolean
}

/**
 * Déplace un joueur de `diceValue` cases sur l'anneau. Si le joueur est déjà
 * au centre, movePlayer ne s'applique pas (le centre ne se quitte pas par un
 * lancer de dé classique dans cette implémentation).
 */
export function movePlayer(player: Player, diceValue: number): MoveResult {
  if (player.isInCenter) {
    throw new Error('Un joueur au centre ne se déplace plus par lancer de dé')
  }

  const newRingIndex = (player.position + diceValue) % RING_SIZE

  return {
    ringIndex: newRingIndex,
    enteredCenterEligible: canEnterCenter(player, newRingIndex),
  }
}

export function enterCenter(player: Player): Player {
  return { ...player, position: CENTER_CELL.index, isInCenter: true }
}
