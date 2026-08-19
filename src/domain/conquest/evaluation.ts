import type { ConquestGameState, ConquestSide } from '../../types/conquest.types'
import { CONQUEST_CORNER_POSITIONS, CONQUEST_EDGE_POSITIONS } from '../../types/conquest.types'
import { countCardsBySide, getNeighborPosition } from './board'
import { ALL_DIRECTIONS } from './capture'
import { otherSide } from './moves'

// Constantes de pondération non issues d'une analyse d'équilibrage formelle —
// à ajuster par playtest une fois les IA branchées sur de vraies parties.
export const MATERIAL_WEIGHT = 10
export const POSITION_WEIGHT = 1
export const EXPOSURE_WEIGHT = 1
export const CORNER_POSITION_WEIGHT = 3
export const EDGE_POSITION_WEIGHT = 2
export const CENTER_POSITION_WEIGHT = 1
/** Valeur de référence utilisée pour pénaliser une face faible exposée. */
export const EXPOSURE_REFERENCE_VALUE = 9

function positionWeight(position: number): number {
  if (CONQUEST_CORNER_POSITIONS.includes(position)) return CORNER_POSITION_WEIGHT
  if (CONQUEST_EDGE_POSITIONS.includes(position)) return EDGE_POSITION_WEIGHT
  return CENTER_POSITION_WEIGHT
}

function materialScore(state: ConquestGameState, side: ConquestSide): number {
  const onBoard = countCardsBySide(state.board)
  const pileState = state.piles[side]
  return onBoard[side] + pileState.pile.length + (pileState.drawnCard ? 1 : 0)
}

/** Coins > bords > centre : un coin n'expose que 2 côtés, le centre en expose 4. */
function positionScore(state: ConquestGameState, side: ConquestSide): number {
  let score = 0
  state.board.forEach((cell, position) => {
    if (cell && cell.ownerId === side) score += positionWeight(position)
  })
  return score
}

/** Pénalité continue pour chaque face de faible valeur tournée vers une case vide adjacente. */
function weakExposure(state: ConquestGameState, side: ConquestSide): number {
  let exposure = 0
  state.board.forEach((cell, position) => {
    if (!cell || cell.ownerId !== side) return
    for (const direction of ALL_DIRECTIONS) {
      const neighborPos = getNeighborPosition(position, direction)
      if (neighborPos === null) continue
      if (state.board[neighborPos] !== null) continue
      exposure += EXPOSURE_REFERENCE_VALUE - cell.card.values[direction]
    }
  })
  return exposure
}

export function evaluateState(state: ConquestGameState, perspective: ConquestSide): number {
  const opponent = otherSide(perspective)

  const material = materialScore(state, perspective) - materialScore(state, opponent)
  const position = positionScore(state, perspective) - positionScore(state, opponent)
  const exposure = weakExposure(state, perspective)

  return MATERIAL_WEIGHT * material + POSITION_WEIGHT * position - EXPOSURE_WEIGHT * exposure
}
