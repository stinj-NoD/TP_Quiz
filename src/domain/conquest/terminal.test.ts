import { describe, expect, it } from 'vitest'
import type { ConquestBoard, ConquestCard, ConquestGameState, ConquestPileState } from '../../types/conquest.types'
import { countCardsBySide, createEmptyBoard } from './board'
import { getResult, isTerminal } from './terminal'

function makeCard(id: string): ConquestCard {
  return { id, name: id, values: { nord: 1, est: 1, sud: 1, ouest: 1 } }
}

function makePileState(overrides: Partial<ConquestPileState> = {}): ConquestPileState {
  return { pile: [], drawnCard: null, mulliganUsed: false, ...overrides }
}

function boardWithOwners(owners: ('A' | 'B')[]): ConquestBoard {
  return owners.map((owner, i) => ({ card: makeCard(`c${i}`), ownerId: owner }))
}

function makeState(overrides: Partial<ConquestGameState> = {}): ConquestGameState {
  return {
    board: createEmptyBoard(),
    piles: { A: makePileState(), B: makePileState() },
    currentTurn: 'A',
    firstPlayer: 'A',
    moveHistory: [],
    ...overrides,
  }
}

describe('isTerminal', () => {
  it('est faux sur un plateau vide ou partiel', () => {
    expect(isTerminal(makeState())).toBe(false)

    const partial = createEmptyBoard()
    partial[0] = { card: makeCard('x'), ownerId: 'A' }
    expect(isTerminal(makeState({ board: partial }))).toBe(false)
  })

  it('est vrai quand le plateau est plein', () => {
    const full = boardWithOwners(['A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B'])
    expect(isTerminal(makeState({ board: full }))).toBe(true)
  })
})

describe('getResult', () => {
  it("lève une erreur si la partie n'est pas terminée", () => {
    expect(() => getResult(makeState())).toThrow()
  })

  it('compte plateau + pioche restante : une carte non tirée en fin de partie permet une égalité 5-5', () => {
    // Premier joueur a posé ses 5 cartes (pile vidée), second n'en a posé que 4
    // (1 carte lui reste en pile, jamais piochée) : le plateau seul (5 vs 4)
    // suggérerait A gagnant, mais le score réel (plateau + pioche) est 5-5.
    const board = boardWithOwners(['A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B'])
    const state = makeState({
      board,
      piles: { A: makePileState(), B: makePileState({ pile: [makeCard('leftover')] }) },
    })

    expect(countCardsBySide(board)).toEqual({ A: 5, B: 4 })
    expect(getResult(state)).toEqual({ outcome: 'égalité', cardsControlled: { A: 5, B: 5 } })
  })

  it('désigne le camp avec le plus de cartes contrôlées (plateau + pioche) comme vainqueur', () => {
    const board = boardWithOwners(['A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B'])
    const state = makeState({
      board,
      piles: { A: makePileState(), B: makePileState({ pile: [makeCard('leftover')] }) },
    })

    expect(getResult(state)).toEqual({ outcome: 'A', cardsControlled: { A: 6, B: 4 } })
  })
})
