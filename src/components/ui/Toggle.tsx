interface ToggleProps {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={checked}
      aria-label={label}
      className="relative h-7 w-12 shrink-0 rounded-[var(--radius-full)] transition-colors disabled:opacity-40"
      style={{ backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-surface-raised)' }}
    >
      <span
        className="absolute top-1 h-5 w-5 rounded-full bg-white transition-[left]"
        style={{ left: checked ? '26px' : '4px' }}
      />
    </button>
  )
}
