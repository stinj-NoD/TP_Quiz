import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ScreenHeaderProps {
  title: string
  onBack?: () => void
  showBack?: boolean
  right?: React.ReactNode
  /** Habillage optionnel propre à un mode — 'conquest' pour la DA pixel du mode Conquête.
   *  Par défaut : style neutre, inchangé pour Quiz et Géo. */
  accent?: 'conquest'
}

export function ScreenHeader({ title, onBack, showBack = true, right, accent }: ScreenHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header
      className="flex items-center justify-between gap-2 px-4 py-3 shrink-0"
      style={accent === 'conquest' ? { boxShadow: 'inset 0 -2px 0 var(--color-cq-frame)' } : undefined}
    >
      <div className="flex w-11 items-center">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Retour"
            className={`flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text)] transition-shadow active:scale-95 active:bg-white/10 ${
              accent === 'conquest' ? 'active:shadow-[var(--shadow-cq-sm)]' : 'active:shadow-[var(--glow-sm)]'
            }`}
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>
      <h1 className="flex-1 truncate text-center text-base font-semibold tracking-wide font-[var(--font-display)]">
        {title}
      </h1>
      <div className="flex w-11 items-center justify-end">{right}</div>
    </header>
  )
}
