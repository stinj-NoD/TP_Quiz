import { beforeEach, describe, expect, it } from 'vitest'
import { useConquestStore } from './conquestStore'
import { useGeoStore } from './geoStore'
import { useProfileStore } from './profileStore'
import { useQuizStore } from './quizStore'
import { STORAGE_KEYS } from './storageKeys'

/**
 * Vérifie de bout en bout qu'un stockage local corrompu ne peut plus casser l'app.
 *
 * Le scénario redouté n'est pas le JSON malformé (zustand l'avale déjà) mais le JSON
 * *bien formé et de mauvaise forme* : il traversait le merge superficiel et faisait
 * planter les écrans au premier `.map()` sur l'historique.
 */
function writePersisted(key: string, state: unknown) {
  localStorage.setItem(key, JSON.stringify({ state, version: 1 }))
}

beforeEach(() => {
  localStorage.clear()
  // Les stores sont des singletons partagés entre tests : on repart d'un état propre,
  // sinon un historique restauré par un test précédent fausse l'assertion suivante.
  useConquestStore.setState({ match: null, series: null, history: [] })
  useGeoStore.setState({ history: [] })
  useQuizStore.setState({ quiz: null, history: [] })
  useProfileStore.getState().resetAll()
})

describe('réhydratation défensive des stores', () => {
  it('conquest : un historique non-tableau retombe sur un tableau vide', async () => {
    writePersisted(STORAGE_KEYS.conquest, { history: 'corrompu' })
    await useConquestStore.persist.rehydrate()

    expect(useConquestStore.getState().history).toEqual([])
  })

  it('conquest : les entrées d’historique de mauvaise forme sont écartées', async () => {
    writePersisted(STORAGE_KEYS.conquest, {
      history: [
        null,
        'texte',
        { id: 'incomplet' },
        {
          id: 'conquest-result-1',
          outcome: 'A',
          finishedAt: '2026-01-01T00:00:00.000Z',
          players: { A: { name: 'Alice' }, B: { name: 'Bob' } },
        },
      ],
    })
    await useConquestStore.persist.rehydrate()

    const { history } = useConquestStore.getState()
    expect(history).toHaveLength(1)
    expect(history[0]?.id).toBe('conquest-result-1')
  })

  it('geo : un historique corrompu retombe sur un tableau vide', async () => {
    writePersisted(STORAGE_KEYS.geo, { history: { pas: 'un tableau' } })
    await useGeoStore.persist.rehydrate()

    expect(useGeoStore.getState().history).toEqual([])
  })

  it('geo : une entrée dont les compteurs ne sont pas des nombres est écartée', async () => {
    // Ces champs alimentent des calculs de score : les laisser passer produirait des NaN.
    writePersisted(STORAGE_KEYS.geo, {
      history: [{ playerName: 'Alice', answeredAt: 'x', totalQuestions: 'dix', correctAnswers: 3 }],
    })
    await useGeoStore.persist.rehydrate()

    expect(useGeoStore.getState().history).toEqual([])
  })

  it('quiz : un historique corrompu retombe sur un tableau vide et aucune partie n’est restaurée', async () => {
    writePersisted(STORAGE_KEYS.quiz, { history: 42, quiz: { players: [], currentPlayerIndex: 7 } })
    await useQuizStore.persist.rehydrate()

    const state = useQuizStore.getState()
    expect(state.history).toEqual([])
    // `quiz` n'est plus persisté du tout : une partie en cours ne peut plus être relue.
    expect(state.quiz).toBeNull()
  })

  it('profile : les réglages de mauvais type retombent sur leurs valeurs par défaut', async () => {
    writePersisted(STORAGE_KEYS.profile, {
      playerName: 42,
      soundEnabled: 'oui',
      geoQuestionCount: 'beaucoup',
    })
    await useProfileStore.persist.rehydrate()

    const state = useProfileStore.getState()
    expect(state.playerName).toBe('')
    expect(state.soundEnabled).toBe(true)
    expect(state.geoQuestionCount).toBe(10)
  })

  it('profile : les réglages valides sont bien conservés', async () => {
    writePersisted(STORAGE_KEYS.profile, { playerName: 'Alice', soundEnabled: false, geoQuestionCount: 20 })
    await useProfileStore.persist.rehydrate()

    const state = useProfileStore.getState()
    expect(state.playerName).toBe('Alice')
    expect(state.soundEnabled).toBe(false)
    expect(state.geoQuestionCount).toBe(20)
  })

  it('un JSON totalement malformé ne fait pas planter la réhydratation', async () => {
    localStorage.setItem(STORAGE_KEYS.conquest, '{{{ pas du json')
    await expect(useConquestStore.persist.rehydrate()).resolves.not.toThrow()

    // zustand avale l'erreur de parsing et laisse l'état en place : ce qui compte est que
    // l'app reste utilisable, pas que l'état soit réinitialisé.
    expect(Array.isArray(useConquestStore.getState().history)).toBe(true)
  })
})
