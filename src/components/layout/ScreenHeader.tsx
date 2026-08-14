import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ScreenHeaderProps {
  title: string
  onBack?: () => void
  showBack?: boolean
  right?: React.ReactNode
}

export function ScreenHeader({ title, onBack, showBack = true, right }: ScreenHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header className="flex items-center justify-between gap-2 px-4 py-3 shrink-0">
      <div className="flex w-11 items-center">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Retour"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text)] transition-shadow active:scale-95 active:bg-white/10 active:shadow-[var(--glow-sm)]"
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
