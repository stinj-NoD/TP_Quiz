import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgeLevel } from '../types/question.types'

interface ProfileState {
  playerName: string
  ageLevel: AgeLevel
  geoQuestionCount: number
  geoDuration: number
  soundEnabled: boolean
  vibrationEnabled: boolean
  wakeLockEnabled: boolean
  setPlayerName: (name: string) => void
  setAgeLevel: (level: AgeLevel) => void
  setGeoQuestionCount: (count: number) => void
  setGeoDuration: (duration: number) => void
  toggleSound: () => void
  toggleVibration: () => void
  toggleWakeLock: () => void
  resetAll: () => void
}

const DEFAULTS = {
  playerName: '',
  ageLevel: 'adulte' as AgeLevel,
  geoQuestionCount: 10,
  geoDuration: 60,
  soundEnabled: true,
  vibrationEnabled: true,
  wakeLockEnabled: false,
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setPlayerName: (playerName) => set({ playerName }),
      setAgeLevel: (ageLevel) => set({ ageLevel }),
      setGeoQuestionCount: (geoQuestionCount) => set({ geoQuestionCount }),
      setGeoDuration: (geoDuration) => set({ geoDuration }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleVibration: () => set((state) => ({ vibrationEnabled: !state.vibrationEnabled })),
      toggleWakeLock: () => set((state) => ({ wakeLockEnabled: !state.wakeLockEnabled })),
      resetAll: () => set({ ...DEFAULTS }),
    }),
    { name: 'trivial-poursuit-settings' },
  ),
)
