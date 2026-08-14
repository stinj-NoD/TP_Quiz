import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--gradient-primary)] text-white shadow-[var(--glow-md)] active:shadow-[var(--glow-lg)]',
  secondary:
    'bg-[var(--color-surface-raised)] text-[var(--color-text)] ring-1 ring-[var(--color-border-glow)]',
  ghost: 'bg-transparent text-[var(--color-text)] hover:shadow-[var(--glow-sm)]',
  danger: 'bg-[var(--color-danger)] text-white shadow-[var(--glow-danger)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-full)] font-semibold transition-[transform,box-shadow] active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
