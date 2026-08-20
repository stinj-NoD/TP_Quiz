import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useConquestStore, type ConquestMatchState } from '../store/conquestStore'
import type { ConquestCard, ConquestGameState } from '../types/conquest.types'
import { ConquestMatchScreen } from './ConquestMatchScreen'

function card(id: string, nord = 1, est = 1, sud = 1, ouest = 1): ConquestCard {
  return { id, name: id, values: { nord, est, sud, ouest } }
}

function seedMatch(overrides: { phase?: ConquestMatchState['phase']; game?: Partial<ConquestGameState> } = {}) {
  const match: ConquestMatchState = {
    game: {
      board: new Array(9).fill(null),
      piles: {
        A: { pile: [], drawnCard: null, mulliganUsed: false },
        B: { pile: [], drawnCard: null, mulliganUsed: false },
      },
      currentTurn: 'A',
      firstPlayer: 'A',
      moveHistory: [],
      ...overrides.game,
    },
    phase: overrides.phase ?? 'awaiting-draw',
    players: {
      A: { name: 'Alice', color: 'red', kind: 'human' },
      B: { name: 'Bob', color: 'blue', kind: 'human' },
    },
    lastCapturedPositions: [],
    dealId: 1,
  }
  useConquestStore.setState({ match, series: null, history: [] })
}

/**
 * L'écran voile le plateau tant que le mélange de la donne courante n'a pas été joué.
 * Les tests portent sur le jeu lui-même : on passe l'animation une fois montés, comme
 * le ferait un appui du joueur.
 */
function skipShuffle() {
  const overlay = screen.queryByRole('button', { name: /Distribution des cartes/i })
  if (overlay) fireEvent.click(overlay)
}

function renderScreen() {
  const result = render(
    <MemoryRouter initialEntries={['/conquete/partie']}>
      <Routes>
        <Route path="/conquete/partie" element={<ConquestMatchScreen />} />
        <Route path="/conquete/resultats" element={<div>ECRAN_RESULTATS</div>} />
        <Route path="/conquete" element={<div>ECRAN_SETUP</div>} />
      </Routes>
    </MemoryRouter>,
  )
  skipShuffle()
  return result
}

afterEach(() => {
  useConquestStore.setState({ match: null, series: null, history: [] })
  vi.useRealTimers()
})

describe('ConquestMatchScreen', () => {
  it('pioche puis pose une carte : le tour passe au camp suivant sans capture', () => {
    seedMatch({
      game: {
        piles: {
          A: { pile: [card('a1', 2, 2, 2, 2)], drawnCard: null, mulliganUsed: false },
          B: { pile: [card('b1')], drawnCard: null, mulliganUsed: false },
        },
      },
    })
    renderScreen()

    fireEvent.click(screen.getByRole('button', { name: /piocher une carte/i }))
    expect(useConquestStore.getState().match?.phase).toBe('card-revealed')
    expect(useConquestStore.getState().match?.game.piles.A.drawnCard?.id).toBe('a1')

    fireEvent.click(screen.getByRole('button', { name: /^Case 1,/ }))

    const { match } = useConquestStore.getState()
    expect(match?.game.board[0]?.card.id).toBe('a1')
    expect(match?.game.board[0]?.ownerId).toBe('A')
    expect(match?.game.currentTurn).toBe('B')
    expect(match?.phase).toBe('awaiting-draw')
    expect(match?.game.piles.A.drawnCard).toBeNull()
  })

  it('une capture bascule en resolving-capture puis revient après le délai simulé', () => {
    vi.useFakeTimers()
    const board = new Array(9).fill(null)
    board[1] = { card: card('def', 1, 1, 1, 1), ownerId: 'B' }
    seedMatch({
      phase: 'card-revealed',
      game: {
        board,
        piles: {
          A: { pile: [], drawnCard: card('att', 9, 9, 9, 9), mulliganUsed: false },
          B: { pile: [], drawnCard: null, mulliganUsed: false },
        },
      },
    })
    renderScreen()

    fireEvent.click(screen.getByRole('button', { name: /^Case 5,/ }))
    expect(useConquestStore.getState().match?.phase).toBe('resolving-capture')
    expect(useConquestStore.getState().match?.lastCapturedPositions).toEqual([1])
    expect(screen.getByText(/Capture/)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(useConquestStore.getState().match?.phase).toBe('awaiting-draw')
    expect(useConquestStore.getState().match?.game.board[1]?.ownerId).toBe('A')
  })

  it("le mulligan refuse la carte piochée une seule fois puis disparaît", () => {
    seedMatch({
      phase: 'card-revealed',
      game: {
        piles: {
          A: { pile: [card('next', 4, 4, 4, 4)], drawnCard: card('weak', 1, 1, 1, 1), mulliganUsed: false },
          B: { pile: [], drawnCard: null, mulliganUsed: false },
        },
      },
    })
    renderScreen()

    fireEvent.click(screen.getByRole('button', { name: /Refuser cette carte/i }))

    const { match } = useConquestStore.getState()
    expect(match?.game.piles.A.mulliganUsed).toBe(true)
    expect(match?.game.piles.A.drawnCard?.id).toBe('next')
    expect(screen.queryByRole('button', { name: /Refuser cette carte/i })).not.toBeInTheDocument()
  })

  it('propose de rebattre les cartes tant que la manche n’a pas commencé, puis retire l’option', () => {
    seedMatch({
      game: {
        piles: {
          A: { pile: [card('a1', 2, 2, 2, 2)], drawnCard: null, mulliganUsed: false },
          B: { pile: [card('b1')], drawnCard: null, mulliganUsed: false },
        },
      },
    })
    renderScreen()

    const redeal = screen.getByRole('button', { name: /Rebattre les cartes/i })
    expect(redeal).toBeInTheDocument()

    // Une fois une carte révélée, rebattre annulerait un tirage déjà connu du joueur.
    fireEvent.click(screen.getByRole('button', { name: /piocher une carte/i }))
    expect(screen.queryByRole('button', { name: /Rebattre les cartes/i })).not.toBeInTheDocument()
  })

  it('affiche les deux camps avec leur pioche dans le bandeau de score', () => {
    seedMatch({
      game: {
        piles: {
          A: { pile: [card('a1'), card('a2')], drawnCard: null, mulliganUsed: false },
          B: { pile: [card('b1')], drawnCard: null, mulliganUsed: false },
        },
      },
    })
    renderScreen()

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    // Les deux pioches sont accessibles depuis le bandeau, avec leur compte restant.
    expect(screen.getByRole('button', { name: /Alice : piocher une carte \(2 restantes\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bob : 1 carte restante/i })).toBeInTheDocument()
  })

  it("redirige vers l'écran de configuration si aucune partie n'est en cours", () => {
    useConquestStore.setState({ match: null, series: null, history: [] })
    renderScreen()
    expect(screen.getByText('ECRAN_SETUP')).toBeInTheDocument()
  })

  it('redirige vers les résultats une fois la partie terminée', () => {
    seedMatch({ phase: 'match-complete' })
    renderScreen()
    expect(screen.getByText('ECRAN_RESULTATS')).toBeInTheDocument()
  })
})
