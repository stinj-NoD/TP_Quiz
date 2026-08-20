import { describe, expect, it } from 'vitest'
import type { ConquestPlayerConfig, ConquestSeriesState, ConquestSide } from '../../types/conquest.types'
import { applyRoundOutcome, createSeriesState, getSeriesWinner, isSeriesDecided } from './series'

function makePlayer(name: string): ConquestPlayerConfig {
  return { name, color: 'blue', kind: 'human' }
}

function makePlayers(): Record<ConquestSide, ConquestPlayerConfig> {
  return { A: makePlayer('Joueur A'), B: makePlayer('Joueur B') }
}

describe('createSeriesState', () => {
  it('démarre à 0-0 sans manche jouée', () => {
    const series = createSeriesState(makePlayers())

    expect(series.roundWins).toEqual({ A: 0, B: 0 })
    expect(series.roundsPlayed).toBe(0)
    expect(series.roundOutcomes).toEqual([])
  })
})

describe('applyRoundOutcome', () => {
  it('incrémente le tally du vainqueur de la manche', () => {
    const series = createSeriesState(makePlayers())
    const next = applyRoundOutcome(series, 'A')

    expect(next.roundWins).toEqual({ A: 1, B: 0 })
    expect(next.roundsPlayed).toBe(1)
    expect(next.roundOutcomes).toEqual(['A'])
  })

  it("n'incrémente le tally d'aucun camp en cas d'égalité, mais fait avancer la série", () => {
    const series = createSeriesState(makePlayers())
    const next = applyRoundOutcome(series, 'égalité')

    expect(next.roundWins).toEqual({ A: 0, B: 0 })
    expect(next.roundsPlayed).toBe(1)
    expect(next.roundOutcomes).toEqual(['égalité'])
  })

  it("n'affecte pas l'état précédent (immuable)", () => {
    const series = createSeriesState(makePlayers())
    applyRoundOutcome(series, 'A')

    expect(series.roundWins).toEqual({ A: 0, B: 0 })
    expect(series.roundsPlayed).toBe(0)
  })
})

describe('getSeriesWinner / isSeriesDecided', () => {
  function seriesWithWins(a: number, b: number): ConquestSeriesState {
    let series = createSeriesState(makePlayers())
    for (let i = 0; i < a; i++) series = applyRoundOutcome(series, 'A')
    for (let i = 0; i < b; i++) series = applyRoundOutcome(series, 'B')
    return series
  }

  it('ne désigne aucun vainqueur avant le seuil (1-1)', () => {
    const series = seriesWithWins(1, 1)

    expect(getSeriesWinner(series)).toBeNull()
    expect(isSeriesDecided(series)).toBe(false)
  })

  it('désigne A vainqueur dès 2 manches gagnées', () => {
    const series = seriesWithWins(2, 1)

    expect(getSeriesWinner(series)).toBe('A')
    expect(isSeriesDecided(series)).toBe(true)
  })

  it('désigne B vainqueur dès 2 manches gagnées', () => {
    const series = seriesWithWins(0, 2)

    expect(getSeriesWinner(series)).toBe('B')
    expect(isSeriesDecided(series)).toBe(true)
  })
})
