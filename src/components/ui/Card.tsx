import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  interactive?: boolean
}

export function Card({ children, interactive = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] ring-1 ring-[var(--color-border)] ${
        interactive ? 'transition-[transform,box-shadow] active:scale-[0.98] active:shadow-[var(--glow-sm)]' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
