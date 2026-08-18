import { describe, expect, it } from 'vitest'
import { determineStartingPlayerIndex } from './turnOrder'

describe('determineStartingPlayerIndex', () => {
  it('retourne 0 pour un seul joueur', () => {
    expect(determineStartingPlayerIndex([{ ageLevel: 'adulte' }])).toBe(0)
  })

  it('sélectionne le joueur le plus jeune (enfant < ado < adulte)', () => {
    const players = [{ ageLevel: 'adulte' }, { ageLevel: 'enfant' }, { ageLevel: 'ado' }] as const
    expect(determineStartingPlayerIndex([...players])).toBe(1)
  })

  it('tranche une égalité d\'âge par ordre de saisie (index le plus bas)', () => {
    const players = [{ ageLevel: 'ado' }, { ageLevel: 'enfant' }, { ageLevel: 'enfant' }] as const
    expect(determineStartingPlayerIndex([...players])).toBe(1)
  })

  it('choisit le premier adulte si personne n\'est plus jeune', () => {
    const players = [{ ageLevel: 'adulte' }, { ageLevel: 'adulte' }] as const
    expect(determineStartingPlayerIndex([...players])).toBe(0)
  })
})
