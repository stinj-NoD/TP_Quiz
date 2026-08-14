import { describe, expect, it } from 'vitest'
import { rollDice } from './diceEngine'

describe('rollDice', () => {
  it('retourne toujours une valeur entre 1 et 6', () => {
    for (let i = 0; i < 200; i++) {
      const value = rollDice()
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(6)
      expect(Number.isInteger(value)).toBe(true)
    }
  })
})
