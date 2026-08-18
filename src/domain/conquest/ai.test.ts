import { describe, expect, it } from 'vitest'
import type { ConquestCard, ConquestGameState } from '../../types/conquest.types'
import { createEmptyBoard } from './board'
import { evaluateState } from './evaluation'
import { chooseMoveFacile, chooseMoveMoyen } from './ai'
import { applyMove, getLegalMoves } from './moves'

function makeCard(id: string, nord = 1, est = 1, sud = 1, ouest = 1): ConquestCard {
  return { id, name: id, values: { nord, est, sud, ouest } }
}

function makeState(overrides: Partial<ConquestGameState> = {}): ConquestGameState {
  return {
    board: createEmptyBoard(),
    hands: { A: [makeCard('a1'), makeCard('a2'), makeCard('a3')], B: [] },
    currentTurn: 'A',
    firstPlayer: 'A',
    moveHistory: [],
    ...overrides,
  }
}

describe('chooseMoveFacile', () => {
  it('renvoie toujours un coup légal', () => {
    for (let i = 0; i < 50; i++) {
      const state = makeState()
      const move = chooseMoveFacile(state)
      expect(getLegalMoves(state)).toContainEqual(move)
    }
  })

  it('choisit un coup capturant nettement plus souvent que le hasard uniforme', () => {
    // Un seul coup (parmi 8) capture réellement : poser en position 4 (face
    // nord = 9) contre la carte adverse en position 1 (face sud = 1).
    const board = createEmptyBoard()
    board[1] = { card: makeCard('def', 1, 1, 1, 1), ownerId: 'B' }
    const attacker = makeCard('att', 9, 1, 1, 1)
    const state = makeState({ board, hands: { A: [attacker], B: [] } })

    let capturingPicks = 0
    const trials = 200
    for (let i = 0; i < trials; i++) {
      const move = chooseMoveFacile(state)
      if (applyMove(state, move).capturedPositions.length > 0) capturingPicks++
    }

    // Base uniforme ≈ 1/8 (12.5%) ; le biais de capture doit nettement dépasser ça.
    expect(capturingPicks / trials).toBeGreaterThan(0.4)
  })
})

describe('chooseMoveMoyen', () => {
  it('renvoie toujours un coup légal', () => {
    for (let i = 0; i < 50; i++) {
      const state = makeState()
      const move = chooseMoveMoyen(state)
      expect(getLegalMoves(state)).toContainEqual(move)
    }
  })

  it('choisit toujours parmi les coups dont le score evaluateState est maximal', () => {
    for (let i = 0; i < 20; i++) {
      const board = createEmptyBoard()
      board[8] = { card: makeCard('b1', 3, 3, 3, 3), ownerId: 'B' }
      const state = makeState({ board })

      const move = chooseMoveMoyen(state)
      const chosenScore = evaluateState(applyMove(state, move).state, state.currentTurn)

      const bestScore = Math.max(
        ...getLegalMoves(state).map((m) => evaluateState(applyMove(state, m).state, state.currentTurn)),
      )

      expect(chosenScore).toBe(bestScore)
    }
  })
})
