import { useEffect, useRef } from 'react'
import { useProfileStore } from '../store/profileStore'

export function useWakeLock() {
  const enabled = useProfileStore((state) => state.wakeLockEnabled)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return

    let cancelled = false
    const acquire = async () => {
      try {
        const sentinel = await navigator.wakeLock.request('screen')
        if (cancelled) {
          sentinel.release()
          return
        }
        sentinelRef.current = sentinel
      } catch {
        // no-op : refusé ou indisponible au runtime
      }
    }

    acquire()

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !sentinelRef.current) acquire()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      sentinelRef.current?.release()
      sentinelRef.current = null
    }
  }, [enabled])
}
