import { describe, expect, it } from 'vitest'
import type { ConquestCard, ConquestGameState, ConquestPileState } from '../../types/conquest.types'
import { createEmptyBoard } from './board'
import { canDraw, canMulligan, drawCard, mulligan } from './draw'

function makeCard(id: string): ConquestCard {
  return { id, name: id, values: { nord: 1, est: 1, sud: 1, ouest: 1 } }
}

function makePileState(overrides: Partial<ConquestPileState> = {}): ConquestPileState {
  return { pile: [], drawnCard: null, mulliganUsed: false, ...overrides }
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

describe('canDraw / drawCard', () => {
  it('révèle de façon déterministe la carte en tête de la pile du camp actif', () => {
    const [c1, c2] = [makeCard('c1'), makeCard('c2')]
    const state = makeState({ piles: { A: makePileState({ pile: [c1, c2] }), B: makePileState() } })

    expect(canDraw(state)).toBe(true)
    const next = drawCard(state)

    expect(next.piles.A.drawnCard).toEqual(c1)
    expect(next.piles.A.pile).toEqual([c2])
    expect(next.piles.B).toEqual(state.piles.B)
  })

  it('canDraw est faux si une carte est déjà révélée ou si la pile est vide', () => {
    expect(canDraw(makeState({ piles: { A: makePileState({ drawnCard: makeCard('x') }), B: makePileState() } }))).toBe(
      false,
    )
    expect(canDraw(makeState({ piles: { A: makePileState({ pile: [] }), B: makePileState() } }))).toBe(false)
  })

  it('lève une erreur si le camp actif a déjà une carte révélée', () => {
    const state = makeState({
      piles: { A: makePileState({ drawnCard: makeCard('x'), pile: [makeCard('y')] }), B: makePileState() },
    })
    expect(() => drawCard(state)).toThrow()
  })

  it('lève une erreur si la pile du camp actif est vide', () => {
    const state = makeState({ piles: { A: makePileState({ pile: [] }), B: makePileState() } })
    expect(() => drawCard(state)).toThrow()
  })
})

describe('canMulligan / mulligan', () => {
  it('renvoie la carte piochée en fond de pile et en révèle une nouvelle', () => {
    const [refused, next1, next2] = [makeCard('refused'), makeCard('next1'), makeCard('next2')]
    const state = makeState({
      piles: { A: makePileState({ drawnCard: refused, pile: [next1, next2] }), B: makePileState() },
    })

    expect(canMulligan(state)).toBe(true)
    const next = mulligan(state)

    expect(next.piles.A.drawnCard).toEqual(next1)
    expect(next.piles.A.pile).toEqual([next2, refused])
    expect(next.piles.A.mulliganUsed).toBe(true)
  })

  it('cas limite : mulligan sur la dernière carte de la pile redonne la même carte mais consomme le mulligan', () => {
    const onlyCard = makeCard('only')
    const state = makeState({ piles: { A: makePileState({ drawnCard: onlyCard, pile: [] }), B: makePileState() } })

    const next = mulligan(state)

    expect(next.piles.A.drawnCard).toEqual(onlyCard)
    expect(next.piles.A.pile).toEqual([])
    expect(next.piles.A.mulliganUsed).toBe(true)
  })

  it("canMulligan est faux avant toute pioche ou après usage du mulligan", () => {
    expect(canMulligan(makeState({ piles: { A: makePileState(), B: makePileState() } }))).toBe(false)
    expect(
      canMulligan(
        makeState({
          piles: { A: makePileState({ drawnCard: makeCard('x'), mulliganUsed: true }), B: makePileState() },
        }),
      ),
    ).toBe(false)
  })

  it("lève une erreur si le camp actif n'a pas encore pioché", () => {
    const state = makeState({ piles: { A: makePileState(), B: makePileState() } })
    expect(() => mulligan(state)).toThrow()
  })

  it('lève une erreur si le mulligan a déjà été utilisé', () => {
    const state = makeState({
      piles: { A: makePileState({ drawnCard: makeCard('x'), mulliganUsed: true }), B: makePileState() },
    })
    expect(() => mulligan(state)).toThrow()
  })
})
