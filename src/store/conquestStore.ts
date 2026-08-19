import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CONQUEST_CARD_POOL } from '../data/conquest'
import { chooseMoveFacile, chooseMoveMoyen, shouldAiMulligan } from '../domain/conquest/ai'
import { dealPiles } from '../domain/conquest/deck'
import { canDraw, canMulligan, drawCard, mulligan as mulliganDrawnCard } from '../domain/conquest/draw'
import { applyMove, getLegalMoves } from '../domain/conquest/moves'
import { createInitialState } from '../domain/conquest/state'
import { getResult, isTerminal } from '../domain/conquest/terminal'
import { CONQUEST_PILE_SIZE } from '../types/conquest.types'
import type {
  ConquestGameState,
  ConquestMatchConfig,
  ConquestPlayerConfig,
  ConquestSessionResult,
  ConquestSide,
  ConquestStorePhase,
} from '../types/conquest.types'

const MAX_HISTORY = 50

export interface ConquestMatchState {
  game: ConquestGameState
  phase: ConquestStorePhase
  players: Record<ConquestSide, ConquestPlayerConfig>
  lastCapturedPositions: number[]
}

interface ConquestStore {
  match: ConquestMatchState | null
  history: ConquestSessionResult[]

  startMatch: (config: ConquestMatchConfig) => void
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
      history: [],

      startMatch: (config) => {
        const { pileA, pileB } = dealPiles(CONQUEST_CARD_POOL, CONQUEST_PILE_SIZE)
        set({
          match: {
            game: createInitialState({ pileA, pileB }),
            phase: 'awaiting-draw',
            players: config.players,
            lastCapturedPositions: [],
          },
        })
      },

      abandonMatch: () => set({ match: null }),

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
        }))

        return result
      },
    }),
    { name: 'ludopia-conquest-state', partialize: (state) => ({ history: state.history }) },
  ),
)
