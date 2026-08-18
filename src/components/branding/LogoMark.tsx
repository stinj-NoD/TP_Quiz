interface LogoMarkProps {
  size?: number
  className?: string
}

/** Le symbole de Ludopia : deux anneaux (violet/cyan) qui s'accrochent, jetons d'un univers de jeux. */
export function LogoMark({ size = 40, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Ludopia"
    >
      <defs>
        <radialGradient id="logoMarkCoin" cx="35%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#241340" />
          <stop offset="55%" stopColor="#130a24" />
          <stop offset="100%" stopColor="#05030a" />
        </radialGradient>
        <linearGradient id="logoMarkRingA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c4b1fc" />
        </linearGradient>
        <linearGradient id="logoMarkRingB" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#c8fbff" />
        </linearGradient>
        <filter id="logoMarkBloom" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="logoMarkSpark" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="115" fill="url(#logoMarkCoin)" />
      <circle cx="256" cy="256" r="250" fill="none" stroke="rgba(167,139,250,0.35)" strokeWidth="2" />
      <g filter="url(#logoMarkBloom)">
        <circle cx="206" cy="256" r="108" fill="none" stroke="url(#logoMarkRingA)" strokeWidth="30" />
        <circle cx="306" cy="256" r="108" fill="none" stroke="url(#logoMarkRingB)" strokeWidth="30" />
        <circle cx="256" cy="160.3" r="13" fill="#f7f3ff" filter="url(#logoMarkSpark)" />
        <circle cx="256" cy="351.7" r="13" fill="#f0abfc" filter="url(#logoMarkSpark)" />
        <circle cx="256" cy="160.3" r="7.15" fill="#ffffff" />
        <circle cx="256" cy="351.7" r="7.15" fill="#ffffff" />
      </g>
    </svg>
  )
}
