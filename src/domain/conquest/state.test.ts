import { describe, expect, it } from 'vitest'
import type { ConquestCard } from '../../types/conquest.types'
import { createInitialState } from './state'

function makePile(prefix: string, count: number): ConquestCard[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    name: `${prefix} ${i}`,
    values: { nord: 1, est: 1, sud: 1, ouest: 1 },
  }))
}

describe('createInitialState', () => {
  it('construit un état cohérent avec la configuration fournie', () => {
    const pileA = makePile('a', 5)
    const pileB = makePile('b', 5)
    const state = createInitialState({ pileA, pileB, firstPlayer: 'A' })

    expect(state.board).toEqual(new Array(9).fill(null))
    expect(state.piles.A).toEqual({ pile: pileA, drawnCard: null, mulliganUsed: false })
    expect(state.piles.B).toEqual({ pile: pileB, drawnCard: null, mulliganUsed: false })
    expect(state.currentTurn).toBe('A')
    expect(state.firstPlayer).toBe('A')
    expect(state.moveHistory).toEqual([])
  })

  it('respecte le premier joueur explicitement fourni', () => {
    const state = createInitialState({ pileA: makePile('a', 5), pileB: makePile('b', 5), firstPlayer: 'B' })
    expect(state.currentTurn).toBe('B')
    expect(state.firstPlayer).toBe('B')
  })

  it('tire aléatoirement le premier joueur si omis (les deux issues apparaissent)', () => {
    const results = new Set(
      Array.from({ length: 200 }, () => {
        const state = createInitialState({ pileA: makePile('a', 5), pileB: makePile('b', 5) })
        return state.firstPlayer
      }),
    )
    expect(results).toEqual(new Set(['A', 'B']))
  })
})
