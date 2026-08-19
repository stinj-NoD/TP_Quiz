import { BrainCircuit, Globe2, Home, Swords, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

interface Tab {
  path: string
  label: string
  icon: typeof Home
}

const TABS: Tab[] = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/quiz', label: 'Quiz', icon: BrainCircuit },
  { path: '/geographie', label: 'Géo', icon: Globe2 },
  { path: '/conquete', label: 'Conquête', icon: Swords },
  { path: '/profil', label: 'Profil', icon: User },
]

export function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="flex shrink-0 items-stretch gap-1 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
      {TABS.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className="flex flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] py-1.5 transition-[color,transform] active:scale-95"
            style={{ color: active ? 'var(--color-primary-light)' : 'var(--color-text-muted)' }}
          >
            <Icon size={22} strokeWidth={1.75} style={active ? { filter: 'drop-shadow(0 0 5px var(--color-primary-light))' } : undefined} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
