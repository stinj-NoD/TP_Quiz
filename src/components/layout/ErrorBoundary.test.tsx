import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'
import { STORAGE_KEYS } from '../../store/storageKeys'

function Boom(): never {
  throw new Error('panne simulée')
}

beforeEach(() => {
  // React journalise l'erreur rattrapée : on tait ce bruit attendu pour garder la sortie lisible.
  vi.spyOn(console, 'error').mockImplementation(() => {})
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('affiche normalement ses enfants quand rien ne plante', () => {
    render(
      <ErrorBoundary>
        <p>contenu normal</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('contenu normal')).toBeInTheDocument()
  })

  it("rattrape une exception de rendu et affiche un écran de secours actionnable", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recharger' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Réinitialiser les données' })).toBeInTheDocument()
    // Le message d'origine reste visible : sans lui, un rapport de bug est inexploitable.
    expect(screen.getByText('panne simulée')).toBeInTheDocument()
  })

  it('purge toutes les clés persistées de l’app quand on réinitialise', () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.setItem(key, '{"state":{},"version":1}')
    }
    localStorage.setItem('clé-tierce', 'à préserver')

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    screen.getByRole('button', { name: 'Réinitialiser les données' }).click()

    for (const key of Object.values(STORAGE_KEYS)) {
      expect(localStorage.getItem(key)).toBeNull()
    }
    // On ne touche qu'à ce qui appartient à l'app.
    expect(localStorage.getItem('clé-tierce')).toBe('à préserver')
  })
})
