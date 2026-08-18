interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  label?: string
}

export function Slider({ value, min, max, step = 1, onChange, label }: SliderProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">{label}</span>
          <span className="text-sm font-bold text-[var(--color-primary-light)]">{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full appearance-none rounded-[var(--radius-full)] bg-[var(--color-surface-raised)] accent-[var(--color-primary-light)] ring-1 ring-[var(--color-border)]"
      />
    </div>
  )
}
