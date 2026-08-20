/**
 * Clés localStorage utilisées par les stores persistés, centralisées pour que
 * l'écran de secours (ErrorBoundary) puisse purger l'intégralité de l'état de
 * l'application sans dupliquer cette liste.
 *
 * Les trois clés `trivial-poursuit-*` datent de l'ancien nom du projet. Les renommer
 * ferait perdre les données des utilisateurs existants (historique, profil), ce qui
 * ne vaut pas le gain cosmétique : elles restent en l'état, documentées ici.
 */
export const STORAGE_KEYS = {
  conquest: 'ludopia-conquest-state',
  geo: 'trivial-poursuit-geo-history',
  profile: 'trivial-poursuit-settings',
  quiz: 'trivial-poursuit-quiz-state',
} as const

/**
 * Purge l'état persisté de l'application. Utilisé en dernier recours quand une
 * donnée corrompue empêche l'app de démarrer : c'est la seule issue accessible,
 * puisque l'écran de réinitialisation habituel (Profil) fait lui-même partie de
 * ce qui peut planter.
 */
export function clearPersistedState() {
  for (const key of Object.values(STORAGE_KEYS)) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Stockage indisponible (mode privé, quota) : on continue sur les autres clés.
    }
  }
}
