import type { ConquestGameState, ConquestMove, ConquestSide } from '../../types/conquest.types'
import { resolveCaptures } from './capture'

export function otherSide(side: ConquestSide): ConquestSide {
  return side === 'A' ? 'B' : 'A'
}

export function getLegalMoves(state: ConquestGameState): ConquestMove[] {
  const hand = state.hands[state.currentTurn]
  const emptyPositions = state.board.reduce<number[]>((positions, cell, position) => {
    if (!cell) positions.push(position)
    return positions
  }, [])

  const moves: ConquestMove[] = []
  for (const card of hand) {
    for (const position of emptyPositions) {
      moves.push({ side: state.currentTurn, cardId: card.id, position })
    }
  }
  return moves
}

/**
 * Applique un coup : retire la carte de la main du joueur actif, la pose sur
 * le plateau, résout les captures, puis passe la main. Renvoie explicitement
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

  const hand = state.hands[move.side]
  const cardIndex = hand.findIndex((card) => card.id === move.cardId)
  if (cardIndex === -1) {
    throw new Error(`La carte ${move.cardId} n'est pas dans la main du joueur ${move.side}`)
  }

  const card = hand[cardIndex]
  const nextHand = [...hand.slice(0, cardIndex), ...hand.slice(cardIndex + 1)]

  const boardWithPlacement = [...state.board]
  boardWithPlacement[move.position] = { card, ownerId: move.side }

  const { board: nextBoard, capturedPositions } = resolveCaptures(boardWithPlacement, move.position)

  const nextState: ConquestGameState = {
    board: nextBoard,
    hands: { ...state.hands, [move.side]: nextHand },
    currentTurn: otherSide(state.currentTurn),
    firstPlayer: state.firstPlayer,
    moveHistory: [...state.moveHistory, move],
  }

  return { state: nextState, capturedPositions }
}
