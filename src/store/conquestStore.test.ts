import { beforeEach, describe, expect, it } from 'vitest'
import type { ConquestBoard, ConquestCard, ConquestPlayerConfig } from '../types/conquest.types'
import { useConquestStore } from './conquestStore'

function human(name: string): ConquestPlayerConfig {
  return { name, color: 'red', kind: 'human' }
}

function ai(difficulty: 'facile' | 'moyen'): ConquestPlayerConfig {
  return { name: `IA ${difficulty}`, color: 'blue', kind: 'ai', difficulty }
}

function makeCard(id: string): ConquestCard {
  return { id, name: id, values: { nord: 1, est: 1, sud: 1, ouest: 1 } }
}

function boardWithOwners(owners: ('A' | 'B')[]): ConquestBoard {
  return owners.map((owner, i) => ({ card: makeCard(`c${i}`), ownerId: owner }))
}

/** Force la manche en cours à un état terminé avec un résultat déterministe (plateau + pioches
 *  restantes cohérents avec la logique de getResult), pour tester la mise à jour du tally de
 *  série sans dépendre du hasard d'une partie IA jouée en entier. */
function forceRoundResult(outcome: 'A' | 'B' | 'égalité') {
  const { match } = useConquestStore.getState()
  if (!match) throw new Error('aucune manche en cours')

  const board =
    outcome === 'A'
      ? boardWithOwners(['A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B'])
      : outcome === 'B'
        ? boardWithOwners(['B', 'B', 'B', 'B', 'B', 'B', 'A', 'A', 'A'])
        : boardWithOwners(['A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B'])
  const leftoverPileB = outcome === 'égalité' ? [makeCard('leftover')] : []

  useConquestStore.setState({
    match: {
      ...match,
      phase: 'match-complete',
      game: {
        ...match.game,
        board,
        piles: {
          A: { pile: [], drawnCard: null, mulliganUsed: false },
          B: { pile: leftoverPileB, drawnCard: null, mulliganUsed: false },
        },
      },
    },
  })
}

beforeEach(() => {
  useConquestStore.setState({ match: null, series: null, history: [] })
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

describe('startSeries', () => {
  it('crée une série à 0-0 et démarre sa première manche', () => {
    useConquestStore.getState().startSeries({ players: { A: human('Alice'), B: human('Bob') } })
    const { match, series } = useConquestStore.getState()

    expect(series).not.toBeNull()
    expect(series?.roundWins).toEqual({ A: 0, B: 0 })
    expect(series?.roundsPlayed).toBe(0)
    expect(match).not.toBeNull()
    expect(match?.phase).toBe('awaiting-draw')
  })
})

describe('startNextRound', () => {
  it('ne fait rien sans série en cours', () => {
    useConquestStore.getState().startNextRound()
    expect(useConquestStore.getState().match).toBeNull()
  })

  it('démarre une nouvelle manche en réutilisant les joueurs figés de la série', () => {
    useConquestStore.getState().startSeries({ players: { A: human('Alice'), B: human('Bob') } })
    useConquestStore.getState().draw() // avance un peu la manche 1 pour vérifier qu'elle est bien remplacée

    useConquestStore.getState().startNextRound()
    const { match, series } = useConquestStore.getState()

    expect(match?.phase).toBe('awaiting-draw')
    expect(match?.players.A.name).toBe('Alice')
    expect(series?.players.A.name).toBe('Alice')
  })
})

describe('redealRound', () => {
  it('ne fait rien sans manche en cours', () => {
    useConquestStore.getState().redealRound()
    expect(useConquestStore.getState().match).toBeNull()
  })

  it('redistribue de nouvelles piles tant que rien n’a été pioché', () => {
    useConquestStore.getState().startSeries({ players: { A: human('Alice'), B: human('Bob') } })
    const before = useConquestStore.getState().match!.game.piles.A.pile.map((c) => c.id)

    useConquestStore.getState().redealRound()
    const after = useConquestStore.getState().match!.game.piles.A.pile.map((c) => c.id)

    expect(after).toHaveLength(5)
    // Sur un pool de 190 cartes, retomber deux fois sur la même main est hautement improbable :
    // un échec ici signalerait une redistribution qui n'a pas eu lieu.
    expect(after).not.toEqual(before)
  })

  it('conserve les joueurs et le score de la série', () => {
    useConquestStore.getState().startSeries({ players: { A: human('Alice'), B: human('Bob') } })
    forceRoundResult('A')
    useConquestStore.getState().finalizeMatch()
    useConquestStore.getState().startNextRound()

    useConquestStore.getState().redealRound()

    expect(useConquestStore.getState().match?.players.A.name).toBe('Alice')
    expect(useConquestStore.getState().series?.roundWins).toEqual({ A: 1, B: 0 })
  })

  it('est refusé dès qu’une carte a été piochée', () => {
    useConquestStore.getState().startSeries({ players: { A: human('Alice'), B: human('Bob') } })
    useConquestStore.getState().draw()
    const drawn = useConquestStore.getState().match!.game.piles

    useConquestStore.getState().redealRound()

    expect(useConquestStore.getState().match!.game.piles).toEqual(drawn)
  })

  it('est refusé dès qu’une carte a été posée', () => {
    useConquestStore.getState().startSeries({ players: { A: human('Alice'), B: human('Bob') } })
    useConquestStore.getState().draw()
    useConquestStore.getState().place(0)
    const boardBefore = useConquestStore.getState().match!.game.board

    useConquestStore.getState().redealRound()

    expect(useConquestStore.getState().match!.game.board).toEqual(boardBefore)
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

  it('incrémente le tally de série quand une manche se termine sur une victoire', () => {
    useConquestStore.getState().startSeries({ players: { A: human('Alice'), B: human('Bob') } })
    forceRoundResult('A')

    useConquestStore.getState().finalizeMatch()
    const { series } = useConquestStore.getState()

    expect(series?.roundWins).toEqual({ A: 1, B: 0 })
    expect(series?.roundsPlayed).toBe(1)
  })

  it("n'incrémente le tally d'aucun camp sur une égalité, mais avance le compteur de manches", () => {
    useConquestStore.getState().startSeries({ players: { A: human('Alice'), B: human('Bob') } })
    forceRoundResult('égalité')

    useConquestStore.getState().finalizeMatch()
    const { series } = useConquestStore.getState()

    expect(series?.roundWins).toEqual({ A: 0, B: 0 })
    expect(series?.roundsPlayed).toBe(1)
  })

  it('laisse series à null quand la manche a été démarrée hors série (startMatch seul)', () => {
    useConquestStore.getState().startMatch({ players: { A: human('Alice'), B: human('Bob') } })
    forceRoundResult('A')

    useConquestStore.getState().finalizeMatch()
    expect(useConquestStore.getState().series).toBeNull()
  })
})

describe('abandonMatch', () => {
  it('efface la partie en cours quelle que soit la phase', () => {
    useConquestStore.getState().startMatch({ players: { A: human('Alice'), B: human('Bob') } })
    useConquestStore.getState().draw()
    useConquestStore.getState().abandonMatch()
    expect(useConquestStore.getState().match).toBeNull()
  })

  it('efface aussi la série en cours', () => {
    useConquestStore.getState().startSeries({ players: { A: human('Alice'), B: human('Bob') } })
    useConquestStore.getState().abandonMatch()
    expect(useConquestStore.getState().series).toBeNull()
  })
})
