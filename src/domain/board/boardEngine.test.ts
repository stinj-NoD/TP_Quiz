import { describe, expect, it } from 'vitest'
import { BOARD_RING, RADIUS_CELL_INDICES } from '../../data/board/boardLayout'
import { createEmptyWedges, type Player } from '../../types/game.types'
import { canEnterCenter, enterCenter, hasAllWedges, movePlayer } from './boardEngine'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Joueur 1',
    color: 'red',
    ageLevel: 'adulte',
    position: 0,
    wedges: createEmptyWedges(),
    isInCenter: false,
    ...overrides,
  }
}

describe('hasAllWedges', () => {
  it('retourne false tant que toutes les catégories ne sont pas remportées', () => {
    const player = makePlayer({ wedges: { ...createEmptyWedges(), geographie: true } })
    expect(hasAllWedges(player)).toBe(false)
  })

  it('retourne true quand les 6 camemberts sont acquis', () => {
    const wedges = createEmptyWedges()
    for (const key of Object.keys(wedges) as (keyof typeof wedges)[]) {
      wedges[key] = true
    }
    expect(hasAllWedges(makePlayer({ wedges }))).toBe(true)
  })
})

describe('movePlayer', () => {
  it("fait avancer le joueur d'exactement diceValue cases sur l'anneau", () => {
    const player = makePlayer({ position: 2 })
    const result = movePlayer(player, 3)
    expect(result.ringIndex).toBe(5)
  })

  it("boucle sur l'anneau quand le déplacement dépasse sa taille", () => {
    const ringSize = BOARD_RING.length
    const player = makePlayer({ position: ringSize - 2 })
    const result = movePlayer(player, 5)
    expect(result.ringIndex).toBe((ringSize - 2 + 5) % ringSize)
  })

  it('lève une erreur si le joueur est déjà au centre', () => {
    const player = makePlayer({ isInCenter: true })
    expect(() => movePlayer(player, 3)).toThrow()
  })

  it("signale l'éligibilité au centre uniquement si le joueur a les 6 camemberts et atterrit sur une case wedge", () => {
    const wedges = createEmptyWedges()
    for (const key of Object.keys(wedges) as (keyof typeof wedges)[]) {
      wedges[key] = true
    }
    const targetWedgeIndex = RADIUS_CELL_INDICES[0]
    const player = makePlayer({ position: 0, wedges })
    const result = movePlayer(player, targetWedgeIndex)
    expect(result.ringIndex).toBe(targetWedgeIndex)
    expect(result.enteredCenterEligible).toBe(true)
  })
})

describe('canEnterCenter', () => {
  it('refuse un joueur sans les 6 camemberts même sur une case wedge', () => {
    const player = makePlayer()
    expect(canEnterCenter(player, RADIUS_CELL_INDICES[0])).toBe(false)
  })

  it("refuse un joueur complet qui n'est pas sur une case wedge", () => {
    const wedges = createEmptyWedges()
    for (const key of Object.keys(wedges) as (keyof typeof wedges)[]) {
      wedges[key] = true
    }
    const nonWedgeIndex = BOARD_RING.find((c) => c.type !== 'wedge')!.index
    const player = makePlayer({ wedges })
    expect(canEnterCenter(player, nonWedgeIndex)).toBe(false)
  })
})

describe('enterCenter', () => {
  it('place le joueur au centre et marque isInCenter à true', () => {
    const player = makePlayer({ position: 4 })
    const updated = enterCenter(player)
    expect(updated.isInCenter).toBe(true)
    expect(updated.position).not.toBe(4)
  })
})
