interface GeoScoreSummaryProps {
  correct: number
  total: number
}

export function GeoScoreSummary({ correct, total }: GeoScoreSummaryProps) {
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[var(--color-surface-raised)] ring-4 ring-[var(--color-primary-light)] shadow-[var(--glow-md)]">
        <span className="text-3xl font-bold font-[var(--font-display)]">{percent}%</span>
      </div>
      <p className="text-sm text-[var(--color-text-muted)]">
        {correct} / {total} bonnes réponses
      </p>
    </div>
  )
}
