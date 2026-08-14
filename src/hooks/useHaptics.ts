import { useProfileStore } from '../store/profileStore'

export function useHaptics() {
  const enabled = useProfileStore((state) => state.vibrationEnabled)

  return (pattern: number | number[] = 20) => {
    if (!enabled) return
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
    try {
      navigator.vibrate(pattern)
    } catch {
      // no-op : non supporté ou bloqué par le navigateur
    }
  }
}
