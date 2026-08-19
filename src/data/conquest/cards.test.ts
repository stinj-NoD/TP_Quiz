import { describe, expect, it } from 'vitest'
import { CONQUEST_PILE_SIZE } from '../../types/conquest.types'
import { CONQUEST_CARD_POOL } from './index'

const DIRECTIONS = ['nord', 'est', 'sud', 'ouest'] as const
const RARITIES = new Set(['commune', 'rare', 'legendaire'])

describe('CONQUEST_CARD_POOL', () => {
  it('a un identifiant unique au format cq-NNN pour chaque carte', () => {
    const seen = new Set<string>()
    for (const card of CONQUEST_CARD_POOL) {
      expect(card.id).toMatch(/^cq-\d{3}$/)
      expect(seen.has(card.id)).toBe(false)
      seen.add(card.id)
    }
  })

  it('a un nom non vide pour chaque carte', () => {
    for (const card of CONQUEST_CARD_POOL) {
      expect(card.name.trim().length).toBeGreaterThan(0)
    }
  })

  it('a les 4 valeurs directionnelles, entières et bornées entre 1 et 9', () => {
    for (const card of CONQUEST_CARD_POOL) {
      for (const direction of DIRECTIONS) {
        const value = card.values[direction]
        expect(Number.isInteger(value)).toBe(true)
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThanOrEqual(9)
      }
    }
  })

  it('a une rareté valide quand elle est renseignée', () => {
    for (const card of CONQUEST_CARD_POOL) {
      if (card.rarity !== undefined) {
        expect(RARITIES.has(card.rarity)).toBe(true)
      }
    }
  })

  it('contient assez de cartes pour distribuer deux piles sans chevauchement', () => {
    expect(CONQUEST_CARD_POOL.length).toBeGreaterThanOrEqual(CONQUEST_PILE_SIZE * 2)
  })
})
