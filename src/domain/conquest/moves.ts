import type { ConquestGameState, ConquestMove, ConquestSide } from '../../types/conquest.types'
import { resolveCaptures } from './capture'

export function otherSide(side: ConquestSide): ConquestSide {
  return side === 'A' ? 'B' : 'A'
}

/**
 * Un seul coup possible par tour : celui qui pose la carte déjà piochée
 * (`drawnCard`) sur une case vide. Renvoie un tableau vide tant que le camp
 * actif n'a pas encore pioché ce tour-ci.
 */
export function getLegalMoves(state: ConquestGameState): ConquestMove[] {
  const drawnCard = state.piles[state.currentTurn].drawnCard
  if (!drawnCard) return []

  const emptyPositions = state.board.reduce<number[]>((positions, cell, position) => {
    if (!cell) positions.push(position)
    return positions
  }, [])

  return emptyPositions.map((position) => ({ side: state.currentTurn, cardId: drawnCard.id, position }))
}

/**
 * Applique un coup : pose la carte piochée par le joueur actif sur le
 * plateau, résout les captures, puis passe la main. Renvoie explicitement
 * `capturedPositions` pour que l'IA et une future UI n'aient pas à comparer
 * deux plateaux pour savoir ce qui vient d'être capturé.
 */
export function applyMove(
  state: ConquestGameState,
  move: ConquestMove,
): { state: ConquestGameState; capturedPositions: number[] } {
  if (move.side !== state.currentTurn) {
    throw new Error(`Ce n'est pas au joueur ${move.side} de jouer`)
  }
  if (state.board[move.position]) {
    throw new Error(`La position ${move.position} est déjà occupée`)
  }

  const pileState = state.piles[move.side]
  const card = pileState.drawnCard
  if (!card || card.id !== move.cardId) {
    throw new Error(`Le joueur ${move.side} n'a pas pioché la carte ${move.cardId}`)
  }

  const boardWithPlacement = [...state.board]
  boardWithPlacement[move.position] = { card, ownerId: move.side }

  const { board: nextBoard, capturedPositions } = resolveCaptures(boardWithPlacement, move.position)

  const nextState: ConquestGameState = {
    board: nextBoard,
    piles: { ...state.piles, [move.side]: { ...pileState, drawnCard: null } },
    currentTurn: otherSide(state.currentTurn),
    firstPlayer: state.firstPlayer,
    moveHistory: [...state.moveHistory, move],
  }

  return { state: nextState, capturedPositions }
}
