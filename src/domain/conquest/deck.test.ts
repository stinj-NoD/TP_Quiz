import { describe, expect, it } from 'vitest'
import type { ConquestCard } from '../../types/conquest.types'
import { chooseFirstPlayer, dealPiles, shuffle } from './deck'

function makePool(count: number): ConquestCard[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `card-${i}`,
    name: `Carte ${i}`,
    values: { nord: 1, est: 1, sud: 1, ouest: 1 },
  }))
}

describe('shuffle', () => {
  it('préserve le multi-ensemble des éléments (même longueur, mêmes éléments)', () => {
    const pool = makePool(10)
    for (let i = 0; i < 20; i++) {
      const result = shuffle(pool)
      expect(result).toHaveLength(pool.length)
      expect(new Set(result.map((c) => c.id))).toEqual(new Set(pool.map((c) => c.id)))
    }
  })

  it("ne modifie pas le tableau d'entrée", () => {
    const pool = makePool(10)
    const before = [...pool]
    shuffle(pool)
    expect(pool).toEqual(before)
  })

  it("produit au moins un ordre différent de l'original sur plusieurs tirages", () => {
    const pool = makePool(10)
    const original = pool.map((c) => c.id).join(',')
    const anyDifferent = Array.from({ length: 20 }, () => shuffle(pool).map((c) => c.id).join(','))
      .some((order) => order !== original)
    expect(anyDifferent).toBe(true)
  })
})

describe('dealPiles', () => {
  it('distribue deux piles sans chevauchement, toutes issues du pool', () => {
    const pool = makePool(20)
    const { pileA, pileB } = dealPiles(pool, 5)

    expect(pileA).toHaveLength(5)
    expect(pileB).toHaveLength(5)

    const idsA = new Set(pileA.map((c) => c.id))
    const idsB = new Set(pileB.map((c) => c.id))
    expect([...idsA].every((id) => !idsB.has(id))).toBe(true)

    const poolIds = new Set(pool.map((c) => c.id))
    for (const card of [...pileA, ...pileB]) {
      expect(poolIds.has(card.id)).toBe(true)
    }
  })

  it('lève une erreur si le pool est trop petit', () => {
    const pool = makePool(9)
    expect(() => dealPiles(pool, 5)).toThrow()
  })
})

describe('chooseFirstPlayer', () => {
  it('retourne A et B sur un grand nombre de tirages', () => {
    const results = new Set(Array.from({ length: 200 }, () => chooseFirstPlayer()))
    expect(results).toEqual(new Set(['A', 'B']))
  })
})
