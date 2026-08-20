import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  /** Habillage optionnel propre à un mode — 'conquest' pour la DA pixel du mode Conquête.
   *  Par défaut : style neutre, inchangé pour Quiz et Géo. */
  accent?: 'conquest'
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[image:var(--gradient-primary)] text-white shadow-[var(--glow-md)] active:shadow-[var(--glow-lg)]',
  secondary:
    'bg-[var(--color-surface-raised)] text-[var(--color-text)] ring-1 ring-[var(--color-border-glow)]',
  ghost: 'bg-transparent text-[var(--color-text)] hover:shadow-[var(--glow-sm)]',
  danger: 'bg-[var(--color-danger)] text-white shadow-[var(--glow-danger)]',
}

const conquestVariantClasses: Partial<Record<ButtonVariant, string>> = {
  primary:
    'bg-[image:var(--gradient-cq)] text-white ring-2 ring-[var(--color-cq-frame)] shadow-[var(--shadow-cq)] active:shadow-[var(--shadow-cq-sm)]',
  secondary:
    'bg-[var(--color-surface-raised)] text-[var(--color-text)] ring-2 ring-[var(--color-cq-frame)] shadow-[var(--shadow-cq-sm)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  accent,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const variantClass = (accent === 'conquest' && conquestVariantClasses[variant]) || variantClasses[variant]
  // Angles nets pour la DA pixel, pilule ailleurs : le rayon fait partie de l'identité
  // du mode, il ne peut pas rester dans la classe de base sans entrer en conflit.
  const radiusClass = accent === 'conquest' ? 'rounded-[var(--radius-sm)]' : 'rounded-[var(--radius-full)]'

  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 ${radiusClass} font-semibold transition-[transform,box-shadow] active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:active:scale-100 ${variantClass} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
