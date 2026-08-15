import { describe, expect, it } from 'vitest'
import { createEmptyWedges, type Player } from '../../types/game.types'
import { hasAllWedges, movePlayer } from './boardEngine'

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
  it("fait avancer le joueur d'exactement diceValue cases sur l'anneau quand aucun wedge n'est croisé", () => {
    const result = movePlayer('ring-1', 2, undefined)
    expect(result).toEqual({ nodeId: 'ring-3', awaitingChoice: false })
  })

  it("boucle sur l'anneau quand le déplacement dépasse sa taille (sans croiser de wedge)", () => {
    // ring-22 + 1 = ring-23 (pas de wedge entre les deux, wedges sur les multiples de 4)
    const result = movePlayer('ring-22', 1, undefined)
    expect(result).toEqual({ nodeId: 'ring-23', awaitingChoice: false })
  })

  it("atterrit sur une case wedge sans attente de choix quand il ne reste plus de pas (le choix ne se pose qu'au pas suivant)", () => {
    // ring-1 + 3 = ring-4 (wedge), il reste alors 0 pas : le déplacement
    // s'arrête normalement sur le wedge, sans décision à prendre ce tour-ci.
    const result = movePlayer('ring-1', 3, undefined)
    expect(result).toEqual({ nodeId: 'ring-4', awaitingChoice: false })
  })

  it("s'arrête en attente de choix en atteignant un wedge avec au moins un pas restant", () => {
    // ring-1 + 3 = ring-4 (wedge) avec 1 pas restant sur un total de 4.
    const result = movePlayer('ring-1', 4, undefined)
    expect(result.awaitingChoice).toBe(true)
    expect(result.nodeId).toBe('ring-4')
    expect(result.branchNodeId).toBe('ring-4')
    expect(result.remainingSteps).toBe(1)
  })

  it("reprend vers l'anneau (ring) après un choix de direction sur un wedge", () => {
    const paused = movePlayer('ring-1', 4, undefined)
    expect(paused.awaitingChoice).toBe(true)
    const resumed = movePlayer(paused.nodeId, paused.remainingSteps!, 'ring')
    expect(resumed).toEqual({ nodeId: 'ring-5', awaitingChoice: false })
  })

  it('reprend vers le rayon (arm) après un choix de direction sur un wedge', () => {
    const paused = movePlayer('ring-1', 4, undefined)
    expect(paused.awaitingChoice).toBe(true)
    const resumed = movePlayer(paused.nodeId, paused.remainingSteps!, 'arm')
    expect(resumed.awaitingChoice).toBe(false)
    expect(resumed.nodeId).toBe('arm-divertissement-1')
  })

  it('un dépassement en fin de rayon plafonne au centre plutôt que de rebondir', () => {
    // ring-1 + 3 = ring-4 (wedge, divertissement), avec 2 pas restants sur un
    // total de 5. En choisissant "arm", 2 pas dans un rayon de 3 cases
    // laissent le joueur en milieu de rayon (pas de dépassement ici), donc ce
    // test enchaîne un second tour de 6 pour dépasser la fin du rayon.
    const paused = movePlayer('ring-1', 5, undefined)
    expect(paused.awaitingChoice).toBe(true)
    expect(paused.remainingSteps).toBe(2)
    const midArm = movePlayer(paused.nodeId, paused.remainingSteps!, 'arm')
    expect(midArm).toEqual({ nodeId: 'arm-divertissement-2', awaitingChoice: false })
    const overshoot = movePlayer(midArm.nodeId, 6, undefined)
    expect(overshoot).toEqual({ nodeId: 'center', awaitingChoice: false })
  })

  it('un lancer exact atteint le centre en fin de rayon sans dépassement', () => {
    // ring-0 est un wedge : remaining=4 > 0, donc on doit choisir une
    // direction dès ce premier appel plutôt que de s'arrêter dessus.
    const resumed = movePlayer('ring-0', 4, 'arm')
    expect(resumed).toEqual({ nodeId: 'center', awaitingChoice: false })
  })

  it('un pas insuffisant pour atteindre le centre laisse le joueur en milieu de rayon', () => {
    const resumed = movePlayer('ring-0', 2, 'arm')
    expect(resumed).toEqual({ nodeId: 'arm-geographie-2', awaitingChoice: false })
  })
})
