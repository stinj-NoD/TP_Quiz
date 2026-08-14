interface ProgressBarProps {
  value: number
  max: number
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div className="h-2 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--color-surface-raised)] ring-1 ring-[var(--color-border)]">
      <div
        className="h-full rounded-[var(--radius-full)] bg-[linear-gradient(90deg,var(--color-primary),var(--color-accent-cyan))] shadow-[0_0_8px_var(--color-primary-light)] transition-[width] duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
