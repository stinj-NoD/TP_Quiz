import type { ConquestGameConfig, ConquestGameState } from '../../types/conquest.types'
import { createEmptyBoard } from './board'
import { chooseFirstPlayer } from './deck'

export function createInitialState(config: ConquestGameConfig): ConquestGameState {
  const firstPlayer = config.firstPlayer ?? chooseFirstPlayer()

  return {
    board: createEmptyBoard(),
    piles: {
      A: { pile: [...config.pileA], drawnCard: null, mulliganUsed: false },
      B: { pile: [...config.pileB], drawnCard: null, mulliganUsed: false },
    },
    currentTurn: firstPlayer,
    firstPlayer,
    moveHistory: [],
  }
}
