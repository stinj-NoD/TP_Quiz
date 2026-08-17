import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BoardGameResult } from '../types/game.types'

const MAX_HISTORY = 50

function sortByMostRecent(results: BoardGameResult[]): BoardGameResult[] {
  return [...results].sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())
}

interface BoardHistoryStore {
  history: BoardGameResult[]
  addResult: (result: BoardGameResult) => void
  clearHistory: () => void
}

export const useBoardHistoryStore = create<BoardHistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addResult: (result) =>
        set((state) => ({ history: sortByMostRecent([...state.history, result]).slice(0, MAX_HISTORY) })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'trivial-poursuit-board-history', partialize: (state) => ({ history: state.history }) },
  ),
)
