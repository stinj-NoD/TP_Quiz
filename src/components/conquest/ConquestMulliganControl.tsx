import { Button } from '../ui/Button'

interface ConquestMulliganControlProps {
  visible: boolean
  onMulligan: () => void
}

export function ConquestMulliganControl({ visible, onMulligan }: ConquestMulliganControlProps) {
  if (!visible) return null

  return (
    <Button variant="secondary" size="md" onClick={onMulligan} className="mx-auto">
      Refuser cette carte (mulligan, 1 fois par partie)
    </Button>
  )
}
