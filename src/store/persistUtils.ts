/**
 * Outils de réhydratation défensive pour les stores persistés.
 *
 * zustand n'intercepte que le JSON *malformé* (il retombe alors silencieusement sur les
 * valeurs par défaut). Un JSON bien formé mais de mauvaise forme — `history` valant une
 * chaîne, une entrée `null` dans un tableau — traverse le merge superficiel et casse au
 * premier `.map()` côté écran. Ces helpers coupent ce chemin à la source.
 */

/** Renvoie uniquement les entrées de tableau qui passent le prédicat ; `[]` si l'entrée n'est pas un tableau. */
export function sanitizeArray<T>(value: unknown, isValid: (entry: unknown) => entry is T): T[] {
  if (!Array.isArray(value)) return []
  return value.filter(isValid)
}

/** Vrai pour un objet non nul (et non tableau), forme minimale attendue d'une entrée d'historique. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Construit un `merge` pour `persist` qui ne conserve du state persisté que les champs
 * dont le type correspond à celui de la valeur par défaut, et applique en plus des
 * validateurs ciblés (typiquement pour les tableaux d'historique).
 *
 * Tout champ absent, d'un type inattendu ou rejeté par son validateur retombe sur la
 * valeur courante (les défauts du store).
 */
export function createSafeMerge<S extends object>(
  validators: Partial<Record<keyof S, (value: unknown) => unknown>> = {},
) {
  return (persistedState: unknown, currentState: S): S => {
    if (!isRecord(persistedState)) return currentState

    const merged: Record<string, unknown> = { ...(currentState as Record<string, unknown>) }

    for (const [key, persistedValue] of Object.entries(persistedState)) {
      if (!(key in currentState)) continue

      const validator = validators[key as keyof S]
      if (validator) {
        merged[key] = validator(persistedValue)
        continue
      }

      // Sans validateur dédié : on n'accepte que si le type primitif correspond au défaut.
      // Les fonctions du store ne sont jamais sérialisées, donc jamais concernées ici.
      const currentValue = (currentState as Record<string, unknown>)[key]
      if (typeof currentValue === 'function') continue

      // Un défaut `null` ne renseigne sur aucun type attendu (`typeof null === 'object'`),
      // et laisserait donc passer n'importe quel objet. Ces champs exigent un validateur
      // explicite, faute de quoi on conserve le défaut.
      if (currentValue === null) continue

      if (typeof persistedValue === typeof currentValue && persistedValue !== null) {
        merged[key] = persistedValue
      }
    }

    return merged as S
  }
}
