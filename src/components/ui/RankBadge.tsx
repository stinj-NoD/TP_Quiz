const RANK_COLORS: Record<number, string> = {
  0: '#ffd60a',
  1: '#c9c9d9',
  2: '#c9a06a',
}

export function RankBadge({ index }: { index: number }) {
  const rankColor = RANK_COLORS[index]
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold font-[var(--font-display)]"
      style={{
        backgroundColor: rankColor ?? 'var(--color-surface-raised)',
        color: rankColor ? '#1a1420' : 'var(--color-text-muted)',
        boxShadow: rankColor ? `0 0 10px ${rankColor}88` : undefined,
      }}
    >
      {index + 1}
    </span>
  )
}
