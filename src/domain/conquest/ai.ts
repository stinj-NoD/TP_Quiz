import type { ConquestGameState, ConquestMove } from '../../types/conquest.types'
import { evaluateState } from './evaluation'
import { applyMove, getLegalMoves } from './moves'

/** Probabilité de préférer un coup capturant s'il en existe un, plutôt qu'un coup légal aléatoire. */
export const FACILE_CAPTURE_BIAS = 0.7

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function requireLegalMoves(state: ConquestGameState): ConquestMove[] {
  const legalMoves = getLegalMoves(state)
  if (legalMoves.length === 0) {
    throw new Error('Aucun coup légal disponible : ne pas appeler une IA sur une partie terminée')
  }
  return legalMoves
}

/**
 * IA facile : légère préférence pour les coups qui capturent au moins une
 * carte, sinon coup légal aléatoire — jamais aussi fort qu'une évaluation
 * complète du plateau (voir chooseMoveMoyen).
 */
export function chooseMoveFacile(state: ConquestGameState): ConquestMove {
  const legalMoves = requireLegalMoves(state)

  const capturingMoves = legalMoves.filter(
    (move) => applyMove(state, move).capturedPositions.length > 0,
  )

  if (capturingMoves.length > 0 && Math.random() < FACILE_CAPTURE_BIAS) {
    return pickRandom(capturingMoves)
  }
  return pickRandom(legalMoves)
}

/**
 * IA moyenne : évalue chaque coup légal via evaluateState (matériel, position,
 * exposition) et choisit parmi les coups de score maximal, égalité tranchée
 * aléatoirement.
 */
export function chooseMoveMoyen(state: ConquestGameState): ConquestMove {
  const legalMoves = requireLegalMoves(state)
  const perspective = state.currentTurn

  const scoredMoves = legalMoves.map((move) => ({
    move,
    score: evaluateState(applyMove(state, move).state, perspective),
  }))

  const bestScore = Math.max(...scoredMoves.map((s) => s.score))
  const bestMoves = scoredMoves.filter((s) => s.score === bestScore).map((s) => s.move)

  return pickRandom(bestMoves)
}
