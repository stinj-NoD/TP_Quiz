import type { ConquestBoard, ConquestDirection } from '../../types/conquest.types'
import { getNeighborPosition } from './board'

export const OPPOSITE_DIRECTION: Record<ConquestDirection, ConquestDirection> = {
  nord: 'sud',
  sud: 'nord',
  est: 'ouest',
  ouest: 'est',
}

export const ALL_DIRECTIONS: ConquestDirection[] = ['nord', 'est', 'sud', 'ouest']

export function getOpposingDirection(direction: ConquestDirection): ConquestDirection {
  return OPPOSITE_DIRECTION[direction]
}

/**
 * Résout les captures autour de la carte qui vient d'être posée à `position`.
 * Seuls les 4 voisins immédiats sont examinés — pas de réaction en chaîne (la
 * variante "Combo" est explicitement hors MVP, voir docs/architecture.md §9).
 * Une capture a lieu si la valeur de la carte posée face à un voisin adverse
 * est strictement supérieure à la valeur du voisin tournée vers elle (sa face
 * opposée à la direction d'attaque). Une égalité ne capture jamais.
 */
export function resolveCaptures(
  board: ConquestBoard,
  position: number,
): { board: ConquestBoard; capturedPositions: number[] } {
  const attackerCell = board[position]
  if (!attackerCell) {
    throw new Error(`Aucune carte à la position ${position}`)
  }

  const nextBoard = [...board]
  const capturedPositions: number[] = []

  for (const direction of ALL_DIRECTIONS) {
    const neighborPos = getNeighborPosition(position, direction)
    if (neighborPos === null) continue

    const neighborCell = nextBoard[neighborPos]
    if (!neighborCell || neighborCell.ownerId === attackerCell.ownerId) continue

    const attackerValue = attackerCell.card.values[direction]
    const defenderValue = neighborCell.card.values[getOpposingDirection(direction)]

    if (attackerValue > defenderValue) {
      nextBoard[neighborPos] = { card: neighborCell.card, ownerId: attackerCell.ownerId }
      capturedPositions.push(neighborPos)
    }
  }

  return { board: nextBoard, capturedPositions }
}
