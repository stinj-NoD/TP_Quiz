import { describe, expect, it } from 'vitest'
import type { ConquestCard, ConquestGameState, ConquestPileState } from '../../types/conquest.types'
import { createEmptyBoard } from './board'
import { resolveCaptures } from './capture'
import { applyMove, getLegalMoves } from './moves'

function makeCard(id: string, nord = 1, est = 1, sud = 1, ouest = 1): ConquestCard {
  return { id, name: id, values: { nord, est, sud, ouest } }
}

function makePileState(overrides: Partial<ConquestPileState> = {}): ConquestPileState {
  return { pile: [], drawnCard: null, mulliganUsed: false, ...overrides }
}

function makeState(overrides: Partial<ConquestGameState> = {}): ConquestGameState {
  return {
    board: createEmptyBoard(),
    piles: {
      A: makePileState({ drawnCard: makeCard('a1') }),
      B: makePileState({ drawnCard: makeCard('b1') }),
    },
    currentTurn: 'A',
    firstPlayer: 'A',
    moveHistory: [],
    ...overrides,
  }
}

describe('getLegalMoves', () => {
  it('produit un coup par case vide pour la carte piochée du camp actif', () => {
    const state = makeState()
    const moves = getLegalMoves(state)
    expect(moves).toHaveLength(9)
    expect(moves.every((move) => move.cardId === 'a1' && move.side === 'A')).toBe(true)
  })

  it("ne renvoie aucun coup si le camp actif n'a pas encore pioché", () => {
    const state = makeState({ piles: { A: makePileState(), B: makePileState({ drawnCard: makeCard('b1') }) } })
    expect(getLegalMoves(state)).toEqual([])
  })

  it('ne renvoie aucun coup sur un plateau plein', () => {
    const board = createEmptyBoard().map((_, i) => ({ card: makeCard(`c${i}`), ownerId: i % 2 === 0 ? 'A' : 'B' })) as ConquestGameState['board']
    const state = makeState({ board })
    expect(getLegalMoves(state)).toEqual([])
  })
})

describe('applyMove', () => {
  it('pose la carte piochée, vide la carte piochée du camp actif, et passe la main', () => {
    const state = makeState()
    const { state: next } = applyMove(state, { side: 'A', cardId: 'a1', position: 0 })

    expect(next.board[0]?.card.id).toBe('a1')
    expect(next.board[0]?.ownerId).toBe('A')
    expect(next.piles.A.drawnCard).toBeNull()
    expect(next.piles.B).toEqual(state.piles.B)
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

  it("lève une erreur si le camp n'a pas encore pioché de carte", () => {
    const state = makeState({ piles: { A: makePileState(), B: makePileState({ drawnCard: makeCard('b1') }) } })
    expect(() => applyMove(state, { side: 'A', cardId: 'a1', position: 0 })).toThrow()
  })

  it("lève une erreur si la carte indiquée n'est pas celle piochée par le camp actif", () => {
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
    const state = makeState({
      board,
      piles: { A: makePileState({ drawnCard: makeCard('att', 9, 9, 9, 9) }), B: makePileState() },
    })

    const { capturedPositions } = applyMove(state, { side: 'A', cardId: 'att', position: 4 })

    const boardWithPlacement = [...board]
    boardWithPlacement[4] = { card: makeCard('att', 9, 9, 9, 9), ownerId: 'A' }
    const directResult = resolveCaptures(boardWithPlacement, 4)

    expect(capturedPositions).toEqual(directResult.capturedPositions)
  })
})
