import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgeLevel } from '../types/question.types'
import { createSafeMerge } from './persistUtils'
import { STORAGE_KEYS } from './storageKeys'

interface ProfileState {
  playerName: string
  ageLevel: AgeLevel
  geoQuestionCount: number
  geoDuration: number
  geoAutoAdvanceDelayMs: number
  soundEnabled: boolean
  vibrationEnabled: boolean
  wakeLockEnabled: boolean
  setPlayerName: (name: string) => void
  setAgeLevel: (level: AgeLevel) => void
  setGeoQuestionCount: (count: number) => void
  setGeoDuration: (duration: number) => void
  setGeoAutoAdvanceDelayMs: (delayMs: number) => void
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
  geoAutoAdvanceDelayMs: 2000,
  soundEnabled: true,
  vibrationEnabled: true,
  wakeLockEnabled: false,
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      // Trim ici plutôt qu'à l'affichage : c'est le seul point d'entrée qui persiste
      // ce nom, et il pré-remplit ensuite les écrans de mise en place.
      setPlayerName: (playerName) => set({ playerName: playerName.trim() }),
      setAgeLevel: (ageLevel) => set({ ageLevel }),
      setGeoQuestionCount: (geoQuestionCount) => set({ geoQuestionCount }),
      setGeoDuration: (geoDuration) => set({ geoDuration }),
      setGeoAutoAdvanceDelayMs: (geoAutoAdvanceDelayMs) => set({ geoAutoAdvanceDelayMs }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleVibration: () => set((state) => ({ vibrationEnabled: !state.vibrationEnabled })),
      toggleWakeLock: () => set((state) => ({ wakeLockEnabled: !state.wakeLockEnabled })),
      resetAll: () => set({ ...DEFAULTS }),
    }),
    {
      name: STORAGE_KEYS.profile,
      version: 1,
      migrate: (persistedState) => persistedState as Partial<ProfileState>,
      // Sans validateur dédié : createSafeMerge ne retient un champ que si son type
      // correspond à celui du défaut, ce qui suffit ici (réglages primitifs uniquement).
      merge: createSafeMerge<ProfileState>(),
    },
  ),
)
