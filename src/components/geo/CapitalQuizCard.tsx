import { Landmark, MapPin } from 'lucide-react'
import type { Country, GeoQuizType } from '../../types/geo.types'

interface CapitalQuizCardProps {
  country: Country
  type: Extract<GeoQuizType, 'country-to-capital' | 'capital-to-country'>
}

export function CapitalQuizCard({ country, type }: CapitalQuizCardProps) {
  const isCountryPrompt = type === 'country-to-capital'
  const Icon = isCountryPrompt ? MapPin : Landmark
  const promptText = isCountryPrompt ? country.nameFr : country.capital

  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] p-6 text-center ring-1 ring-[var(--color-border)]">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gradient-primary)] shadow-[var(--glow-sm)]">
        <Icon size={26} color="white" />
      </span>
      <p className="text-2xl font-bold">{promptText}</p>
    </div>
  )
}
