import { Component, type ErrorInfo, type ReactNode } from 'react'
import { clearPersistedState } from '../../store/storageKeys'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Filet de sécurité racine : sans lui, la moindre exception pendant le rendu vide tout
 * l'arbre React et laisse un écran blanc. En PWA installée (`display: standalone`) il n'y
 * a ni barre d'adresse ni bouton recharger — l'utilisateur n'aurait aucun moyen de s'en
 * sortir, d'autant que la cause la plus probable (un état persisté corrompu) se reproduit
 * à chaque démarrage. D'où les deux actions proposées, dont la purge du stockage.
 *
 * Le balisage est volontairement autonome (pas de <Button/>, pas de store) : un écran de
 * secours qui dépend des composants de l'app peut planter pour la raison même qu'il tente
 * de rattraper.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur non rattrapée dans le rendu :', error, info.componentStack)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReset = () => {
    clearPersistedState()
    // Repart sur la racine : la route courante peut être précisément celle qui plante.
    window.location.hash = '#/'
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center"
        role="alert"
      >
        <h1 className="text-xl font-bold tracking-wide font-[var(--font-display)]">
          Oups, l'application a planté
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Une erreur inattendue est survenue. Vous pouvez recharger l'application ; si le problème
          persiste, réinitialisez les données locales.
        </p>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex h-14 items-center justify-center rounded-[var(--radius-full)] bg-[image:var(--gradient-primary)] px-6 text-base font-semibold text-white shadow-[var(--glow-md)] transition-transform active:scale-95"
          >
            Recharger
          </button>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex h-14 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-surface-raised)] px-6 text-base font-semibold text-[var(--color-text)] ring-1 ring-[var(--color-border-glow)] transition-transform active:scale-95"
          >
            Réinitialiser les données
          </button>
        </div>

        <p className="max-w-xs break-words text-[11px] text-[var(--color-text-muted)]">{error.message}</p>
      </div>
    )
  }
}
