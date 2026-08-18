import { describe, expect, it } from 'vitest'
import type { ConquestCard, ConquestGameState } from '../../types/conquest.types'
import { createEmptyBoard } from './board'
import { resolveCaptures } from './capture'
import { applyMove, getLegalMoves } from './moves'

function makeCard(id: string, nord = 1, est = 1, sud = 1, ouest = 1): ConquestCard {
  return { id, name: id, values: { nord, est, sud, ouest } }
}

function makeState(overrides: Partial<ConquestGameState> = {}): ConquestGameState {
  return {
    board: createEmptyBoard(),
    hands: { A: [makeCard('a1'), makeCard('a2')], B: [makeCard('b1'), makeCard('b2')] },
    currentTurn: 'A',
    firstPlayer: 'A',
    moveHistory: [],
    ...overrides,
  }
}

describe('getLegalMoves', () => {
  it('produit le produit cartésien main × cases vides', () => {
    const state = makeState()
    const moves = getLegalMoves(state)
    expect(moves).toHaveLength(state.hands.A.length * 9)
  })

  it('ne renvoie aucun coup sur un plateau plein', () => {
    const board = createEmptyBoard().map((_, i) => ({ card: makeCard(`c${i}`), ownerId: i % 2 === 0 ? 'A' : 'B' })) as ConquestGameState['board']
    const state = makeState({ board })
    expect(getLegalMoves(state)).toEqual([])
  })
})

describe('applyMove', () => {
  it('pose la carte, retire uniquement celle-ci de la main, et passe la main', () => {
    const state = makeState()
    const { state: next } = applyMove(state, { side: 'A', cardId: 'a1', position: 0 })

    expect(next.board[0]?.card.id).toBe('a1')
    expect(next.board[0]?.ownerId).toBe('A')
    expect(next.hands.A.map((c) => c.id)).toEqual(['a2'])
    expect(next.hands.B).toEqual(state.hands.B)
    expect(next.currentTurn).toBe('B')
    expect(next.moveHistory).toEqual([{ side: 'A', cardId: 'a1', position: 0 }])
  })

  it('lève une erreur si la position est déjà occupée', () => {
    const state = makeState({
      board: (() => {
        const b = createEmptyBoard()
        b[0] = { card: makeCard('x'), ownerId: 'B' }
        return b
      })(),
    })
    expect(() => applyMove(state, { side: 'A', cardId: 'a1', position: 0 })).toThrow()
  })

  it("lève une erreur si la carte n'est pas dans la main du joueur actif", () => {
    const state = makeState()
    expect(() => applyMove(state, { side: 'A', cardId: 'b1', position: 0 })).toThrow()
  })

  it("lève une erreur si ce n'est pas le tour du camp indiqué", () => {
    const state = makeState({ currentTurn: 'A' })
    expect(() => applyMove(state, { side: 'B', cardId: 'b1', position: 0 })).toThrow()
  })

  it('renvoie des capturedPositions cohérents avec resolveCaptures appelé directement', () => {
    let board = createEmptyBoard()
    board[1] = { card: makeCard('def', 1, 1, 1, 1), ownerId: 'B' }
    const state = makeState({ board, hands: { A: [makeCard('att', 9, 9, 9, 9)], B: [] } })

    const { capturedPositions } = applyMove(state, { side: 'A', cardId: 'att', position: 4 })

    const boardWithPlacement = [...board]
    boardWithPlacement[4] = { card: makeCard('att', 9, 9, 9, 9), ownerId: 'A' }
    const directResult = resolveCaptures(boardWithPlacement, 4)

    expect(capturedPositions).toEqual(directResult.capturedPositions)
  })
})
