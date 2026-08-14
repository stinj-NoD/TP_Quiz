import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BOARD } from '../data/board/boardLayout'
import { canEnterCenter, enterCenter, movePlayer } from '../domain/board/boardEngine'
import { rollDice } from '../domain/board/diceEngine'
import { selectQuestion } from '../domain/questions/questionSelector'
import { isVictory } from '../domain/board/victoryRules'
import { QUESTION_BANKS } from '../data/questions'
import type { GameState, Player, PlayerColor } from '../types/game.types'
import { createEmptyWedges } from '../types/game.types'
import type { AgeLevel } from '../types/question.types'
import { getCell } from '../data/board/boardLayout'

export interface NewPlayerConfig {
  name: string
  color: PlayerColor
  ageLevel: AgeLevel
}

interface GameStore {
  game: GameState | null
  startGame: (players: NewPlayerConfig[]) => void
  resetGame: () => void
  rollDiceForCurrentPlayer: () => void
  /** Applique le déplacement calculé après l'animation du dé. */
  applyPendingMove: () => void
  /** Quand le joueur a le choix d'entrer au centre (case wedge + 6 camemberts). */
  chooseEnterCenter: (enter: boolean) => void
  answerCurrentQuestion: (correct: boolean) => void
}

const initialGameState = (players: NewPlayerConfig[]): GameState => ({
  players: players.map(
    (p, index): Player => ({
      id: `player-${index}`,
      name: p.name,
      color: p.color,
      ageLevel: p.ageLevel,
      position: 0,
      wedges: createEmptyWedges(),
      isInCenter: false,
    }),
  ),
  currentPlayerIndex: 0,
  board: BOARD,
  phase: 'awaiting-roll',
  lastDiceValue: null,
  currentQuestion: null,
  usedQuestionIds: [],
})

function nextPlayerIndex(index: number, total: number): number {
  return (index + 1) % total
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,

      startGame: (players) => set({ game: initialGameState(players) }),

      resetGame: () => set({ game: null }),

      rollDiceForCurrentPlayer: () => {
        const { game } = get()
        if (!game || game.phase !== 'awaiting-roll') return

        const value = rollDice()
        set({ game: { ...game, lastDiceValue: value, phase: 'moving' } })
      },

      applyPendingMove: () => {
        const { game } = get()
        if (!game || game.phase !== 'moving' || game.lastDiceValue == null) return

        const player = game.players[game.currentPlayerIndex]
        const { ringIndex, enteredCenterEligible } = movePlayer(player, game.lastDiceValue)

        const updatedPlayer: Player = { ...player, position: ringIndex }
        const updatedPlayers = game.players.map((p, i) => (i === game.currentPlayerIndex ? updatedPlayer : p))

        if (enteredCenterEligible) {
          // Le joueur peut choisir d'entrer au centre : on attend sa décision.
          set({ game: { ...game, players: updatedPlayers, phase: 'resolving' } })
          return
        }

        const cell = getCell(ringIndex)
        if (cell.type === 'center') {
          set({ game: { ...game, players: updatedPlayers, phase: 'awaiting-answer' } })
          return
        }

        const category = cell.category
        if (!category) {
          // Case sans catégorie (ne devrait pas arriver avec le layout actuel) : fin de tour.
          const newIndex = nextPlayerIndex(game.currentPlayerIndex, game.players.length)
          set({
            game: {
              ...game,
              players: updatedPlayers,
              currentPlayerIndex: newIndex,
              phase: 'awaiting-roll',
              lastDiceValue: null,
            },
          })
          return
        }

        const bank = QUESTION_BANKS[player.ageLevel ?? 'adulte']
        const { question, updatedUsedIds } = selectQuestion(bank, category, game.usedQuestionIds)
        set({
          game: {
            ...game,
            players: updatedPlayers,
            currentQuestion: question,
            usedQuestionIds: updatedUsedIds,
            phase: 'awaiting-answer',
          },
        })
      },

      chooseEnterCenter: (enter) => {
        const { game } = get()
        if (!game || game.phase !== 'resolving') return

        const player = game.players[game.currentPlayerIndex]

        if (enter && canEnterCenter(player, player.position)) {
          const updatedPlayer = enterCenter(player)
          const updatedPlayers = game.players.map((p, i) => (i === game.currentPlayerIndex ? updatedPlayer : p))
          set({ game: { ...game, players: updatedPlayers, phase: 'awaiting-answer' } })
          return
        }

        // Le joueur reste sur l'anneau : on résout la case "wedge" normalement.
        const cell = getCell(player.position)
        const category = cell.category
        if (!category) return

        const bank = QUESTION_BANKS[player.ageLevel ?? 'adulte']
        const { question, updatedUsedIds } = selectQuestion(bank, category, game.usedQuestionIds)
        set({
          game: {
            ...game,
            currentQuestion: question,
            usedQuestionIds: updatedUsedIds,
            phase: 'awaiting-answer',
          },
        })
      },

      answerCurrentQuestion: (correct) => {
        const { game } = get()
        if (!game || game.phase !== 'awaiting-answer') return

        const player = game.players[game.currentPlayerIndex]
        const cell = getCell(player.position)

        // Victoire : joueur au centre avec les 6 camemberts, bonne réponse à la question finale.
        if (cell.type === 'center') {
          if (isVictory(player, correct)) {
            set({ game: { ...game, currentQuestion: null, phase: 'victory' } })
            return
          }
          // Mauvaise réponse au centre : le joueur reste au centre, tour suivant.
          const newIndex = nextPlayerIndex(game.currentPlayerIndex, game.players.length)
          set({
            game: {
              ...game,
              currentQuestion: null,
              currentPlayerIndex: newIndex,
              phase: 'awaiting-roll',
              lastDiceValue: null,
            },
          })
          return
        }

        let updatedPlayers = game.players
        if (correct && cell.type === 'wedge' && cell.category) {
          const updatedPlayer: Player = {
            ...player,
            wedges: { ...player.wedges, [cell.category]: true },
          }
          updatedPlayers = game.players.map((p, i) => (i === game.currentPlayerIndex ? updatedPlayer : p))
        }
        // Case "category" simple : bonne réponse ne rapporte pas de bonus, fin de tour normal.

        const newIndex = nextPlayerIndex(game.currentPlayerIndex, game.players.length)
        set({
          game: {
            ...game,
            players: updatedPlayers,
            currentQuestion: null,
            currentPlayerIndex: newIndex,
            phase: 'awaiting-roll',
            lastDiceValue: null,
          },
        })
      },
    }),
    { name: 'trivial-poursuit-game-state' },
  ),
)
