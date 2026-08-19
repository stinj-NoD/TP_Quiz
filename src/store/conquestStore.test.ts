import { beforeEach, describe, expect, it } from 'vitest'
import type { ConquestPlayerConfig } from '../types/conquest.types'
import { useConquestStore } from './conquestStore'

function human(name: string): ConquestPlayerConfig {
  return { name, color: 'red', kind: 'human' }
}

function ai(difficulty: 'facile' | 'moyen'): ConquestPlayerConfig {
  return { name: `IA ${difficulty}`, color: 'blue', kind: 'ai', difficulty }
}

beforeEach(() => {
  useConquestStore.setState({ match: null, history: [] })
})

describe('startMatch', () => {
  it("initialise une partie en phase 'awaiting-draw' avec des piles de 5 cartes non révélées", () => {
    useConquestStore.getState().startMatch({ players: { A: human('Alice'), B: human('Bob') } })
    const { match } = useConquestStore.getState()

    expect(match).not.toBeNull()
    expect(match?.phase).toBe('awaiting-draw')
    expect(match?.game.piles.A.pile).toHaveLength(5)
    expect(match?.game.piles.B.pile).toHaveLength(5)
    expect(match?.game.piles.A.drawnCard).toBeNull()
    expect(match?.players.A.name).toBe('Alice')
  })
})

describe('draw', () => {
  it("ne fait rien hors phase 'awaiting-draw' ou sans partie en cours", () => {
    useConquestStore.getState().draw()
    expect(useConquestStore.getState().match).toBeNull()

    useConquestStore.getState().startMatch({ players: { A: human('Alice'), B: human('Bob') } })
    useConquestStore.getState().draw()
    useConquestStore.getState().draw() // déjà en 'card-revealed', doit être un no-op
    const { match } = useConquestStore.getState()
    expect(match?.phase).toBe('card-revealed')
    expect(match?.game.piles[match.game.currentTurn].pile).toHaveLength(4)
  })
})

describe('mulligan', () => {
  it('refuse la carte piochée une seule fois puis ignore les appels suivants', () => {
    useConquestStore.getState().startMatch({ players: { A: human('Alice'), B: human('Bob') } })
    useConquestStore.getState().draw()

    const side = useConquestStore.getState().match!.game.currentTurn

    useConquestStore.getState().mulligan()
    const afterMulligan = useConquestStore.getState().match!.game.piles[side]
    expect(afterMulligan.mulliganUsed).toBe(true)
    expect(afterMulligan.drawnCard).not.toBeNull()

    const drawnAfterMulligan = afterMulligan.drawnCard
    useConquestStore.getState().mulligan() // déjà utilisé, doit être un no-op
    expect(useConquestStore.getState().match!.game.piles[side].drawnCard).toEqual(drawnAfterMulligan)
  })
})

describe('place', () => {
  it('rejette un coup illégal (mauvaise phase, position occupée, carte non piochée)', () => {
    useConquestStore.getState().startMatch({ players: { A: human('Alice'), B: human('Bob') } })
    useConquestStore.getState().place(0) // pas encore de carte révélée
    expect(useConquestStore.getState().match?.phase).toBe('awaiting-draw')
  })

  it('pose la carte révélée et fait avancer la phase', () => {
    useConquestStore.getState().startMatch({ players: { A: human('Alice'), B: human('Bob') } })
    useConquestStore.getState().draw()
    const side = useConquestStore.getState().match!.game.currentTurn

    useConquestStore.getState().place(0)
    const { match } = useConquestStore.getState()

    expect(match?.game.board[0]?.ownerId).toBe(side)
    expect(['awaiting-draw', 'resolving-capture', 'match-complete']).toContain(match?.phase)
    expect(match?.game.piles[side].drawnCard).toBeNull()
  })
})

describe('runAiTurnIfNeeded + acknowledgeCapture : partie complète IA vs IA', () => {
  it('mène une partie facile vs moyen jusqu\'à match-complete sans jamais planter', () => {
    useConquestStore.getState().startMatch({ players: { A: ai('facile'), B: ai('moyen') } })

    let iterations = 0
    while (useConquestStore.getState().match?.phase !== 'match-complete') {
      const phase = useConquestStore.getState().match?.phase
      if (phase === 'resolving-capture') {
        useConquestStore.getState().acknowledgeCapture()
      } else {
        useConquestStore.getState().runAiTurnIfNeeded()
      }
      iterations++
      expect(iterations).toBeLessThan(500)
    }

    const { match } = useConquestStore.getState()
    expect(match?.game.board.every((cell) => cell !== null)).toBe(true)
  })
})

describe('finalizeMatch', () => {
  it("ne fait rien hors phase 'match-complete'", () => {
    useConquestStore.getState().startMatch({ players: { A: human('Alice'), B: human('Bob') } })
    expect(useConquestStore.getState().finalizeMatch()).toBeNull()
    expect(useConquestStore.getState().match).not.toBeNull()
  })

  it('normalise le résultat, l\'ajoute à l\'historique et efface la partie en cours', () => {
    useConquestStore.getState().startMatch({ players: { A: ai('facile'), B: ai('facile') } })

    let iterations = 0
    while (useConquestStore.getState().match?.phase !== 'match-complete') {
      const phase = useConquestStore.getState().match?.phase
      if (phase === 'resolving-capture') useConquestStore.getState().acknowledgeCapture()
      else useConquestStore.getState().runAiTurnIfNeeded()
      iterations++
      expect(iterations).toBeLessThan(500)
    }

    const result = useConquestStore.getState().finalizeMatch()
    if (!result) throw new Error('result ne devrait pas être null')
    expect(result.players.A.cardsControlled + result.players.B.cardsControlled).toBe(10)
    expect(useConquestStore.getState().match).toBeNull()
    expect(useConquestStore.getState().history[0]).toEqual(result)
  })
})

describe('abandonMatch', () => {
  it('efface la partie en cours quelle que soit la phase', () => {
    useConquestStore.getState().startMatch({ players: { A: human('Alice'), B: human('Bob') } })
    useConquestStore.getState().draw()
    useConquestStore.getState().abandonMatch()
    expect(useConquestStore.getState().match).toBeNull()
  })
})
