import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CONQUEST_CARD_POOL } from '../data/conquest'
import { chooseMoveFacile, chooseMoveMoyen, shouldAiMulligan } from '../domain/conquest/ai'
import { dealPiles } from '../domain/conquest/deck'
import { canDraw, canMulligan, canRedeal, drawCard, mulligan as mulliganDrawnCard } from '../domain/conquest/draw'
import { applyMove, getLegalMoves } from '../domain/conquest/moves'
import { applyRoundOutcome, createSeriesState } from '../domain/conquest/series'
import { createInitialState } from '../domain/conquest/state'
import { getResult, isTerminal } from '../domain/conquest/terminal'
import { CONQUEST_PILE_SIZE } from '../types/conquest.types'
import { createSafeMerge, isRecord, sanitizeArray } from './persistUtils'
import { STORAGE_KEYS } from './storageKeys'
import type {
  ConquestGameState,
  ConquestMatchConfig,
  ConquestPlayerConfig,
  ConquestSeriesState,
  ConquestSessionResult,
  ConquestSide,
  ConquestStorePhase,
} from '../types/conquest.types'

const MAX_HISTORY = 50

/** Une manche au sein d'une série (voir ConquestSeriesState) — le nom historique
 *  "Match" ne désigne ici qu'une seule manche, pas la série complète. */
export interface ConquestMatchState {
  game: ConquestGameState
  phase: ConquestStorePhase
  players: Record<ConquestSide, ConquestPlayerConfig>
  lastCapturedPositions: number[]
  /** Identifie une distribution ; change à chaque donne, rebattage compris. Sert à l'UI pour
   *  rejouer l'animation de mélange — on ne peut pas le déduire des piles, dont le contenu
   *  bouge aussi à chaque pioche. */
  dealId: number
}

/** Forme minimale exigée d'une entrée d'historique relue du stockage (voir persistUtils). */
function isConquestSessionResult(entry: unknown): entry is ConquestSessionResult {
  if (!isRecord(entry)) return false
  return (
    typeof entry.id === 'string' &&
    typeof entry.finishedAt === 'string' &&
    isRecord(entry.players) &&
    isRecord(entry.players.A) &&
    isRecord(entry.players.B)
  )
}

let nextDealId = 1

function createRoundMatchState(players: Record<ConquestSide, ConquestPlayerConfig>): ConquestMatchState {
  const { pileA, pileB } = dealPiles(CONQUEST_CARD_POOL, CONQUEST_PILE_SIZE)
  return {
    game: createInitialState({ pileA, pileB }),
    phase: 'awaiting-draw',
    players,
    lastCapturedPositions: [],
    dealId: nextDealId++,
  }
}

interface ConquestStore {
  match: ConquestMatchState | null
  series: ConquestSeriesState | null
  history: ConquestSessionResult[]

  startMatch: (config: ConquestMatchConfig) => void
  startSeries: (config: ConquestMatchConfig) => void
  startNextRound: () => void
  redealRound: () => void
  abandonMatch: () => void

  draw: () => void
  mulligan: () => void
  place: (position: number) => void
  acknowledgeCapture: () => void
  runAiTurnIfNeeded: () => void

  finalizeMatch: () => ConquestSessionResult | null
}

export const useConquestStore = create<ConquestStore>()(
  persist(
    (set, get) => ({
      match: null,
      series: null,
      history: [],

      startMatch: (config) => set({ match: createRoundMatchState(config.players) }),

      startSeries: (config) =>
        set({
          series: createSeriesState(config.players),
          match: createRoundMatchState(config.players),
        }),

      startNextRound: () => {
        const { series } = get()
        if (!series) return

        set({ match: createRoundMatchState(series.players) })
      },

      // Redistribue la manche en cours sans toucher au score de la série. Refusé dès qu'une
      // carte a été révélée ou posée (voir canRedeal) : rebattre après coup reviendrait à
      // annuler un tirage que le joueur a déjà vu.
      redealRound: () => {
        const { match } = get()
        if (!match || !canRedeal(match.game)) return

        set({ match: createRoundMatchState(match.players) })
      },

      abandonMatch: () => set({ match: null, series: null }),

      draw: () => {
        const { match } = get()
        if (!match || match.phase !== 'awaiting-draw' || !canDraw(match.game)) return

        set({ match: { ...match, game: drawCard(match.game), phase: 'card-revealed' } })
      },

      mulligan: () => {
        const { match } = get()
        if (!match || match.phase !== 'card-revealed' || !canMulligan(match.game)) return

        set({ match: { ...match, game: mulliganDrawnCard(match.game) } })
      },

      place: (position) => {
        const { match } = get()
        if (!match || match.phase !== 'card-revealed') return

        const drawnCard = match.game.piles[match.game.currentTurn].drawnCard
        if (!drawnCard) return

        const move = { side: match.game.currentTurn, cardId: drawnCard.id, position }
        const isLegal = getLegalMoves(match.game).some(
          (m) => m.side === move.side && m.cardId === move.cardId && m.position === move.position,
        )
        if (!isLegal) return

        const { state: nextGame, capturedPositions } = applyMove(match.game, move)
        const nextPhase: ConquestStorePhase =
          capturedPositions.length > 0 ? 'resolving-capture' : isTerminal(nextGame) ? 'match-complete' : 'awaiting-draw'

        set({ match: { ...match, game: nextGame, phase: nextPhase, lastCapturedPositions: capturedPositions } })
      },

      acknowledgeCapture: () => {
        const { match } = get()
        if (!match || match.phase !== 'resolving-capture') return

        set({
          match: {
            ...match,
            phase: isTerminal(match.game) ? 'match-complete' : 'awaiting-draw',
            lastCapturedPositions: [],
          },
        })
      },

      runAiTurnIfNeeded: () => {
        const { match } = get()
        if (!match || match.phase === 'match-complete' || match.phase === 'resolving-capture') return

        const activeSide = match.game.currentTurn
        const activePlayer = match.players[activeSide]
        if (activePlayer.kind !== 'ai') return

        if (match.phase === 'awaiting-draw') {
          get().draw()
          return
        }

        const pileState = match.game.piles[activeSide]
        const drawnCard = pileState.drawnCard
        if (!drawnCard) return

        if (activePlayer.difficulty === 'moyen' && !pileState.mulliganUsed && shouldAiMulligan(drawnCard)) {
          get().mulligan()
          return
        }

        const chooseMove = activePlayer.difficulty === 'moyen' ? chooseMoveMoyen : chooseMoveFacile
        const move = chooseMove(match.game)
        get().place(move.position)
      },

      finalizeMatch: () => {
        const { match } = get()
        if (!match || match.phase !== 'match-complete') return null

        const gameResult = getResult(match.game)
        const result: ConquestSessionResult = {
          id: `conquest-result-${Date.now()}`,
          outcome: gameResult.outcome,
          players: {
            A: { ...match.players.A, cardsControlled: gameResult.cardsControlled.A },
            B: { ...match.players.B, cardsControlled: gameResult.cardsControlled.B },
          },
          finishedAt: new Date().toISOString(),
        }

        set((state) => ({
          history: [result, ...state.history].slice(0, MAX_HISTORY),
          match: null,
          series: state.series ? applyRoundOutcome(state.series, gameResult.outcome) : null,
        }))

        return result
      },
    }),
    {
      name: STORAGE_KEYS.conquest,
      version: 1,
      // `migrate` doit exister même trivial : sans lui, un futur passage à la version 2
      // ferait jeter silencieusement l'historique de tous les joueurs existants.
      migrate: (persistedState) => persistedState as { history: ConquestSessionResult[] },
      partialize: (state) => ({ history: state.history }),
      merge: createSafeMerge<ConquestStore>({
        history: (value) => sanitizeArray(value, isConquestSessionResult),
      }),
    },
  ),
)
