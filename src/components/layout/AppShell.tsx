import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex justify-center bg-[radial-gradient(circle_at_50%_0%,#150a24,#000000)] h-[100dvh]">
      <div
        className="relative flex flex-col w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)] sm:my-4 sm:rounded-[2.5rem] sm:ring-1 sm:ring-[var(--color-border-glow)] sm:shadow-[var(--shadow-raised),0_0_60px_rgba(124,58,237,0.25)]"
        style={{
          maxWidth: 'var(--app-max-width)',
          height: '100dvh',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
