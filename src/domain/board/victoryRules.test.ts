import { describe, expect, it } from 'vitest'
import { createEmptyWedges, type Player } from '../../types/game.types'
import { canAttemptFinalQuestion, isVictory } from './victoryRules'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Joueur 1',
    color: 'red',
    ageLevel: 'adulte',
    position: 'ring-0',
    wedges: createEmptyWedges(),
    isInCenter: false,
    ...overrides,
  }
}

function fullWedges() {
  const wedges = createEmptyWedges()
  for (const key of Object.keys(wedges) as (keyof typeof wedges)[]) {
    wedges[key] = true
  }
  return wedges
}

describe('canAttemptFinalQuestion', () => {
  it('refuse un joueur au centre sans tous les camemberts', () => {
    const player = makePlayer({ isInCenter: true })
    expect(canAttemptFinalQuestion(player)).toBe(false)
  })

  it('refuse un joueur complet mais pas au centre', () => {
    const player = makePlayer({ wedges: fullWedges(), isInCenter: false })
    expect(canAttemptFinalQuestion(player)).toBe(false)
  })

  it('accepte un joueur complet et au centre', () => {
    const player = makePlayer({ wedges: fullWedges(), isInCenter: true })
    expect(canAttemptFinalQuestion(player)).toBe(true)
  })
})

describe('isVictory', () => {
  it('ne déclare pas victoire sur une mauvaise réponse', () => {
    const player = makePlayer({ wedges: fullWedges(), isInCenter: true })
    expect(isVictory(player, false)).toBe(false)
  })

  it('déclare victoire sur bonne réponse au centre avec tous les camemberts', () => {
    const player = makePlayer({ wedges: fullWedges(), isInCenter: true })
    expect(isVictory(player, true)).toBe(true)
  })

  it("ne déclare pas victoire même sur bonne réponse si le joueur n'est pas éligible", () => {
    const player = makePlayer({ wedges: createEmptyWedges(), isInCenter: true })
    expect(isVictory(player, true)).toBe(false)
  })
})
