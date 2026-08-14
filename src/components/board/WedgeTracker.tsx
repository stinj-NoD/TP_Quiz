import { CATEGORY_COLORS, CATEGORY_IDS } from '../../types/question.types'
import type { CategoryId } from '../../types/question.types'

interface WedgeTrackerProps {
  wedges: Record<CategoryId, boolean>
  size?: number
}

export function WedgeTracker({ wedges, size = 10 }: WedgeTrackerProps) {
  return (
    <div className="flex gap-1">
      {CATEGORY_IDS.map((category) => (
        <span
          key={category}
          className="rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: wedges[category] ? CATEGORY_COLORS[category] : 'transparent',
            boxShadow: wedges[category]
              ? `0 0 6px ${CATEGORY_COLORS[category]}, inset 0 0 0 1.5px ${CATEGORY_COLORS[category]}`
              : `inset 0 0 0 1.5px ${CATEGORY_COLORS[category]}`,
          }}
        />
      ))}
    </div>
  )
}
