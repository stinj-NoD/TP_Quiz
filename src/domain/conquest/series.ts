import type { ConquestOutcome, ConquestPlayerConfig, ConquestSeriesState, ConquestSide } from '../../types/conquest.types'
import { CONQUEST_SERIES_TARGET_WINS } from '../../types/conquest.types'

export function createSeriesState(players: Record<ConquestSide, ConquestPlayerConfig>): ConquestSeriesState {
  return { players, roundWins: { A: 0, B: 0 }, roundsPlayed: 0, roundOutcomes: [] }
}

/**
 * À appeler une fois par manche terminée, avec l'issue de cette manche
 * (getResult(...).outcome). Une égalité ne compte pour aucun camp mais fait
 * tout de même avancer au tour suivant.
 */
export function applyRoundOutcome(series: ConquestSeriesState, outcome: ConquestOutcome): ConquestSeriesState {
  const roundWins = { ...series.roundWins }
  if (outcome !== 'égalité') roundWins[outcome] += 1

  return {
    ...series,
    roundWins,
    roundsPlayed: series.roundsPlayed + 1,
    roundOutcomes: [...series.roundOutcomes, outcome],
  }
}

export function getSeriesWinner(series: ConquestSeriesState): ConquestSide | null {
  if (series.roundWins.A >= CONQUEST_SERIES_TARGET_WINS) return 'A'
  if (series.roundWins.B >= CONQUEST_SERIES_TARGET_WINS) return 'B'
  return null
}

export function isSeriesDecided(series: ConquestSeriesState): boolean {
  return getSeriesWinner(series) !== null
}
