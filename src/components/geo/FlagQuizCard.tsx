import type { Country } from '../../types/geo.types'

interface FlagQuizCardProps {
  country: Country
}

export function FlagQuizCard({ country }: FlagQuizCardProps) {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] p-6 ring-1 ring-[var(--color-border)]">
      <img
        src={country.flagSvgUrl}
        alt="Drapeau à deviner"
        className="max-h-full max-w-full rounded-[var(--radius-sm)] shadow-[var(--shadow-card)]"
      />
    </div>
  )
}
