import type { ConquestBoard, ConquestDirection, ConquestSide } from '../../types/conquest.types'
import { CONQUEST_BOARD_SIZE } from '../../types/conquest.types'

export function createEmptyBoard(): ConquestBoard {
  return new Array(CONQUEST_BOARD_SIZE).fill(null)
}

export function positionToRowCol(position: number): { row: number; col: number } {
  return { row: Math.floor(position / 3), col: position % 3 }
}

/**
 * Position du voisin dans une direction donnée, ou `null` s'il n'y en a pas
 * (bord de plateau). Doit toujours passer par ligne/colonne — jamais un simple
 * `position ± 1` / `± 3` sur l'index brut, qui "boucle" faussement d'un bord à l'autre.
 */
export function getNeighborPosition(position: number, direction: ConquestDirection): number | null {
  const { row, col } = positionToRowCol(position)
  switch (direction) {
    case 'nord':
      return row > 0 ? position - 3 : null
    case 'sud':
      return row < 2 ? position + 3 : null
    case 'est':
      return col < 2 ? position + 1 : null
    case 'ouest':
      return col > 0 ? position - 1 : null
  }
}

export function countCardsBySide(board: ConquestBoard): Record<ConquestSide, number> {
  const counts: Record<ConquestSide, number> = { A: 0, B: 0 }
  for (const cell of board) {
    if (cell) counts[cell.ownerId]++
  }
  return counts
}

export function isBoardFull(board: ConquestBoard): boolean {
  return board.every((cell) => cell !== null)
}
