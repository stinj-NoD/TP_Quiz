import { describe, expect, it } from 'vitest'
import { createSafeMerge, isRecord, sanitizeArray } from './persistUtils'

interface DemoStore {
  history: { id: string }[]
  playerName: string
  soundEnabled: boolean
  count: number
  action: () => void
}

function makeDefaults(): DemoStore {
  return { history: [], playerName: '', soundEnabled: true, count: 10, action: () => {} }
}

function isEntry(entry: unknown): entry is { id: string } {
  return isRecord(entry) && typeof entry.id === 'string'
}

describe('sanitizeArray', () => {
  it('conserve uniquement les entrées valides', () => {
    expect(sanitizeArray([{ id: 'a' }, { id: 'b' }], isEntry)).toEqual([{ id: 'a' }, { id: 'b' }])
  })

  it('écarte les entrées de mauvaise forme (null, primitifs, champs manquants)', () => {
    expect(sanitizeArray([{ id: 'a' }, null, 42, { nope: true }], isEntry)).toEqual([{ id: 'a' }])
  })

  it("renvoie un tableau vide quand la valeur n'est pas un tableau", () => {
    // C'est le cas qui plantait Classement et Profil : `history` valant une chaîne.
    expect(sanitizeArray('corrompu', isEntry)).toEqual([])
    expect(sanitizeArray(null, isEntry)).toEqual([])
    expect(sanitizeArray({ length: 3 }, isEntry)).toEqual([])
  })
})

describe('createSafeMerge', () => {
  const merge = createSafeMerge<DemoStore>({
    history: (value) => sanitizeArray(value, isEntry),
  })

  it('applique le validateur dédié au champ concerné', () => {
    const result = merge({ history: 'corrompu' }, makeDefaults())
    expect(result.history).toEqual([])
  })

  it('conserve les champs persistés dont le type correspond au défaut', () => {
    const result = merge({ playerName: 'Alice', count: 42, soundEnabled: false }, makeDefaults())
    expect(result.playerName).toBe('Alice')
    expect(result.count).toBe(42)
    expect(result.soundEnabled).toBe(false)
  })

  it('ignore les champs persistés dont le type ne correspond pas au défaut', () => {
    const result = merge({ playerName: 123, count: 'beaucoup', soundEnabled: 'oui' }, makeDefaults())
    expect(result.playerName).toBe('')
    expect(result.count).toBe(10)
    expect(result.soundEnabled).toBe(true)
  })

  it("n'accepte rien pour un champ dont le défaut est null, sauf validateur explicite", () => {
    // `typeof null === 'object'` : sans cette garde, n'importe quel objet persisté
    // passerait pour valide (c'est ainsi qu'une partie de quiz périmée était restaurée).
    const withNullable = createSafeMerge<{ session: { id: string } | null; count: number }>()
    const result = withNullable({ session: { id: 'périmée' } }, { session: null, count: 1 })
    expect(result.session).toBeNull()
  })

  it('ignore les champs inconnus et ne détruit pas les actions du store', () => {
    const defaults = makeDefaults()
    const result = merge({ inconnu: 'x', action: 'pas une fonction' }, defaults)
    expect('inconnu' in result).toBe(false)
    expect(typeof result.action).toBe('function')
  })

  it('retombe intégralement sur les défauts si le state persisté est de mauvaise forme', () => {
    expect(merge('corrompu', makeDefaults()).count).toBe(10)
    expect(merge(null, makeDefaults()).count).toBe(10)
    expect(merge([1, 2, 3], makeDefaults()).count).toBe(10)
  })
})
