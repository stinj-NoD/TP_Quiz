import { describe, expect, it } from 'vitest'
import type { ConquestBoard, ConquestCard, ConquestGameState, ConquestPileState } from '../../types/conquest.types'
import { createEmptyBoard } from './board'
import { evaluateState } from './evaluation'

function makeCard(id: string, value = 1): ConquestCard {
  return { id, name: id, values: { nord: value, est: value, sud: value, ouest: value } }
}

function makeState(board: ConquestBoard): ConquestGameState {
  const emptyPile = (): ConquestPileState => ({ pile: [], drawnCard: null, mulliganUsed: false })
  return { board, piles: { A: emptyPile(), B: emptyPile() }, currentTurn: 'A', firstPlayer: 'A', moveHistory: [] }
}

describe('evaluateState', () => {
  it('donne un score plus élevé à la perspective qui contrôle plus de cartes', () => {
    const fewer = createEmptyBoard()
    fewer[0] = { card: makeCard('a1'), ownerId: 'A' }
    fewer[1] = { card: makeCard('b1'), ownerId: 'B' }

    const more = createEmptyBoard()
    more[0] = { card: makeCard('a1'), ownerId: 'A' }
    more[3] = { card: makeCard('a2'), ownerId: 'A' }
    more[1] = { card: makeCard('b1'), ownerId: 'B' }

    expect(evaluateState(makeState(more), 'A')).toBeGreaterThan(evaluateState(makeState(fewer), 'A'))
  })

  it("pénalise davantage un coin adverse qu'un centre adverse (le coin n'expose que 2 côtés)", () => {
    // Cartes de valeur max (10) pour neutraliser le terme d'exposition et isoler la position.
    const opponentOnCorner = createEmptyBoard()
    opponentOnCorner[0] = { card: makeCard('b1', 10), ownerId: 'B' }

    const opponentOnCenter = createEmptyBoard()
    opponentOnCenter[4] = { card: makeCard('b1', 10), ownerId: 'B' }

    expect(evaluateState(makeState(opponentOnCorner), 'A')).toBeLessThan(
      evaluateState(makeState(opponentOnCenter), 'A'),
    )
  })

  it('est symétrique pour un plateau en miroir (cartes de valeur uniforme 10 pour neutraliser l\'exposition)', () => {
    const board = createEmptyBoard()
    board[0] = { card: makeCard('a1', 10), ownerId: 'A' }
    board[3] = { card: makeCard('a2', 10), ownerId: 'A' }
    board[8] = { card: makeCard('b1', 10), ownerId: 'B' }
    board[5] = { card: makeCard('b2', 10), ownerId: 'B' }

    const state = makeState(board)
    expect(evaluateState(state, 'A') + evaluateState(state, 'B')).toBe(0)
  })
})
