interface ConquestTurnBannerProps {
  message: string
}

/** `aria-live` porte les annonces de tour/pioche/capture/résultat pour les lecteurs d'écran. */
export function ConquestTurnBanner({ message }: ConquestTurnBannerProps) {
  return (
    <p aria-live="polite" className="px-4 text-center text-sm font-medium text-[var(--color-text-muted)]">
      {message}
    </p>
  )
}
