import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BOARD, START_NODE_ID, getNode } from '../data/board/boardLayout'
import { movePlayer } from '../domain/board/boardEngine'
import { rollDice } from '../domain/board/diceEngine'
import { selectQuestion } from '../domain/questions/questionSelector'
import { isVictory } from '../domain/board/victoryRules'
import { QUESTION_BANKS } from '../data/questions'
import type { GameState, Player, PlayerColor } from '../types/game.types'
import { createEmptyWedges } from '../types/game.types'
import type { AgeLevel } from '../types/question.types'

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
  /** Quand le joueur atteint un embranchement (case wedge) : continuer sur l'anneau ou entrer dans le rayon. */
  choosePathDirection: (direction: 'ring' | 'arm') => void
  answerCurrentQuestion: (correct: boolean) => void
}

const initialGameState = (players: NewPlayerConfig[]): GameState => ({
  players: players.map(
    (p, index): Player => ({
      id: `player-${index}`,
      name: p.name,
      color: p.color,
      ageLevel: p.ageLevel,
      position: START_NODE_ID,
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
  pendingBranch: null,
})

function nextPlayerIndex(index: number, total: number): number {
  return (index + 1) % total
}

/**
 * Résout la case atteinte après un déplacement (direct ou après reprise sur
 * embranchement) : sélectionne une question pour la catégorie de la case, ou
 * termine le tour immédiatement si la case n'a pas de catégorie associée.
 * `isInCenter` est dérivé du nœud atteint plutôt que suivi séparément.
 */
function resolveLanding(
  game: GameState,
  updatedPlayers: Player[],
  updatedPlayer: Player,
  set: (partial: { game: GameState }) => void,
): void {
  const node = getNode(updatedPlayer.position)
  const playerAtCenter: Player = { ...updatedPlayer, isInCenter: node.type === 'center' }
  const playersWithCenterFlag = updatedPlayers.map((p) =>
    p.id === playerAtCenter.id ? playerAtCenter : p,
  )

  if (node.type === 'center') {
    set({
      game: { ...game, players: playersWithCenterFlag, phase: 'awaiting-answer' },
    })
    return
  }

  const category = node.category
  if (!category) {
    const newIndex = nextPlayerIndex(game.currentPlayerIndex, game.players.length)
    set({
      game: {
        ...game,
        players: playersWithCenterFlag,
        currentPlayerIndex: newIndex,
        phase: 'awaiting-roll',
        lastDiceValue: null,
      },
    })
    return
  }

  const bank = QUESTION_BANKS[playerAtCenter.ageLevel ?? 'adulte']
  const { question, updatedUsedIds } = selectQuestion(bank, category, game.usedQuestionIds)
  set({
    game: {
      ...game,
      players: playersWithCenterFlag,
      currentQuestion: question,
      usedQuestionIds: updatedUsedIds,
      phase: 'awaiting-answer',
    },
  })
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
        const result = movePlayer(player.position, game.lastDiceValue)

        const updatedPlayer: Player = { ...player, position: result.nodeId }
        const updatedPlayers = game.players.map((p, i) => (i === game.currentPlayerIndex ? updatedPlayer : p))

        if (result.awaitingChoice) {
          // Le joueur atteint un embranchement (wedge) : on attend sa décision.
          set({
            game: {
              ...game,
              players: updatedPlayers,
              phase: 'choosing-path',
              pendingBranch: { nodeId: result.branchNodeId!, remainingSteps: result.remainingSteps! },
            },
          })
          return
        }

        resolveLanding(game, updatedPlayers, updatedPlayer, set)
      },

      choosePathDirection: (direction) => {
        const { game } = get()
        if (!game || game.phase !== 'choosing-path' || !game.pendingBranch) return

        const player = game.players[game.currentPlayerIndex]
        const result = movePlayer(game.pendingBranch.nodeId, game.pendingBranch.remainingSteps, direction)

        const updatedPlayer: Player = { ...player, position: result.nodeId }
        const updatedPlayers = game.players.map((p, i) => (i === game.currentPlayerIndex ? updatedPlayer : p))

        resolveLanding({ ...game, pendingBranch: null }, updatedPlayers, updatedPlayer, set)
      },

      answerCurrentQuestion: (correct) => {
        const { game } = get()
        if (!game || game.phase !== 'awaiting-answer') return

        const player = game.players[game.currentPlayerIndex]
        const cell = getNode(player.position)

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
