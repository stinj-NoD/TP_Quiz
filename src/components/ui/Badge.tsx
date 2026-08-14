import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: string
  filled?: boolean
}

export function Badge({ children, color = 'var(--color-primary)', filled = true }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[var(--radius-full)] px-2.5 py-1 text-xs font-semibold"
      style={
        filled
          ? { backgroundColor: color, color: '#fff', boxShadow: `0 0 10px ${color}66` }
          : { color, boxShadow: `inset 0 0 0 1.5px ${color}` }
      }
    >
      {children}
    </span>
  )
}
