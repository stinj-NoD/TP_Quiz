export interface Country {
  cca3: string
  /** Code numérique ISO 3166-1, utilisé pour croiser avec les features world-atlas. */
  ccn3: string
  nameFr: string
  capital: string | null
  flagSvgUrl: string
  region: string
  latlng: [number, number]
  /** Silhouette exploitable dans world-atlas pour le QCM "Pays -> Forme". */
  hasShape: boolean
}

export type GeoQuizType = 'flag-to-country' | 'country-to-capital' | 'capital-to-country' | 'country-to-shape'

export type GeoSessionMode = 'count' | 'timer'

export interface GeoQuizQuestion {
  type: GeoQuizType
  correctCountry: Country
  options: string[]
  correctOptionIndex: number
}

export interface GeoSessionResult {
  mode: GeoSessionMode
  type?: GeoQuizType
  totalQuestions: number
  correctAnswers: number
  answeredAt: string
  durationSeconds?: number
  playerName: string
}

export const GEO_QUIZ_TYPE_LABELS: Record<GeoQuizType, string> = {
  'flag-to-country': 'Drapeau → Pays',
  'country-to-capital': 'Pays → Capitale',
  'capital-to-country': 'Capitale → Pays',
  'country-to-shape': 'Pays → Forme',
}
