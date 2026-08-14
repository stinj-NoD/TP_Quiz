import { useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function useAppUpdate() {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined)
  const [checking, setChecking] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swScriptUrl, registration) {
      registrationRef.current = registration
    },
  })

  const checkForUpdate = async () => {
    if (!registrationRef.current) return
    setChecking(true)
    try {
      await registrationRef.current.update()
    } finally {
      setChecking(false)
    }
  }

  const applyUpdate = () => {
    void updateServiceWorker(true)
  }

  return { needRefresh, checking, checkForUpdate, applyUpdate }
}
