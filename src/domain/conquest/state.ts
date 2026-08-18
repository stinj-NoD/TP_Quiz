import type { ConquestGameConfig, ConquestGameState } from '../../types/conquest.types'
import { createEmptyBoard } from './board'
import { chooseFirstPlayer } from './deck'

export function createInitialState(config: ConquestGameConfig): ConquestGameState {
  const firstPlayer = config.firstPlayer ?? chooseFirstPlayer()

  return {
    board: createEmptyBoard(),
    hands: {
      A: [...config.handA],
      B: [...config.handB],
    },
    currentTurn: firstPlayer,
    firstPlayer,
    moveHistory: [],
  }
}
