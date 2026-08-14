import { ChevronRight, Download, Info, RefreshCw, RotateCcw, Smartphone, Trophy, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Toggle } from '../components/ui/Toggle'
import { useProfileStore } from '../store/profileStore'
import { useGeoStore } from '../store/geoStore'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useAppUpdate } from '../hooks/useAppUpdate'
import { AGE_LEVELS, AGE_LEVEL_LABELS, type AgeLevel } from '../types/question.types'

const QUESTION_COUNTS = [10, 20, 30] as const
const DURATIONS = [60, 120, 180] as const
const AUTO_ADVANCE_DELAYS_MS = [0, 500, 1000, 1500, 2000, 2500, 3000] as const

function formatAutoAdvanceDelay(ms: number): string {
  return ms === 0 ? 'Immédiat' : `${ms / 1000}s`
}

export function ProfileScreen() {
  const navigate = useNavigate()

  const playerName = useProfileStore((state) => state.playerName)
  const setPlayerName = useProfileStore((state) => state.setPlayerName)
  const ageLevel = useProfileStore((state) => state.ageLevel)
  const setAgeLevel = useProfileStore((state) => state.setAgeLevel)
  const geoQuestionCount = useProfileStore((state) => state.geoQuestionCount)
  const setGeoQuestionCount = useProfileStore((state) => state.setGeoQuestionCount)
  const geoDuration = useProfileStore((state) => state.geoDuration)
  const setGeoDuration = useProfileStore((state) => state.setGeoDuration)
  const geoAutoAdvanceDelayMs = useProfileStore((state) => state.geoAutoAdvanceDelayMs)
  const setGeoAutoAdvanceDelayMs = useProfileStore((state) => state.setGeoAutoAdvanceDelayMs)
  const soundEnabled = useProfileStore((state) => state.soundEnabled)
  const toggleSound = useProfileStore((state) => state.toggleSound)
  const vibrationEnabled = useProfileStore((state) => state.vibrationEnabled)
  const toggleVibration = useProfileStore((state) => state.toggleVibration)
  const wakeLockEnabled = useProfileStore((state) => state.wakeLockEnabled)
  const toggleWakeLock = useProfileStore((state) => state.toggleWakeLock)
  const resetProfile = useProfileStore((state) => state.resetAll)

  const history = useGeoStore((state) => state.history)
  const clearHistory = useGeoStore((state) => state.clearHistory)

  const { canInstall, promptInstall } = useInstallPrompt()
  const { needRefresh, checking, checkForUpdate, applyUpdate } = useAppUpdate()

  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const sessionCount = history.length
  const bestPercent =
    sessionCount > 0
      ? Math.max(
          ...history.map((r) => (r.totalQuestions > 0 ? Math.round((r.correctAnswers / r.totalQuestions) * 100) : 0)),
        )
      : null

  const handleReset = () => {
    clearHistory()
    resetProfile()
    setShowResetConfirm(false)
  }

  return (
    <ScreenTransition>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4 pt-6">
        <h1 className="text-2xl font-bold tracking-wide font-[var(--font-display)]">Profil</h1>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Profil</span>
          <Card className="flex flex-col gap-3">
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Votre nom"
              maxLength={20}
              className="rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm text-[var(--color-text)] outline-none ring-1 ring-transparent focus:ring-[var(--color-primary-light)]"
            />
            <div className="flex gap-2">
              {AGE_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setAgeLevel(level as AgeLevel)}
                  className={`flex-1 rounded-[var(--radius-md)] py-2 text-xs font-semibold transition-[transform,box-shadow] active:scale-95 ${
                    ageLevel === level
                      ? 'bg-[var(--gradient-primary)] text-white shadow-[var(--glow-sm)]'
                      : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {AGE_LEVEL_LABELS[level]}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Classement</span>
          <Card interactive className="flex cursor-pointer items-center gap-3" onClick={() => navigate('/classement')}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--gradient-primary)] shadow-[var(--glow-sm)]">
              <Trophy size={20} color="white" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Meilleurs scores Géo</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {sessionCount > 0
                  ? `${sessionCount} session${sessionCount > 1 ? 's' : ''} · record ${bestPercent}%`
                  : 'Aucune session enregistrée'}
              </p>
            </div>
            <ChevronRight size={18} className="text-[var(--color-text-muted)]" />
          </Card>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Réglages</span>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 size={20} className="text-[var(--color-primary-light)]" />
                ) : (
                  <VolumeX size={20} className="text-[var(--color-text-muted)]" />
                )}
                <span className="text-sm font-medium">Sons</span>
              </div>
              <Toggle checked={soundEnabled} onChange={toggleSound} label="Activer ou désactiver les sons" />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-[var(--color-text-muted)]" />
                <span className="text-sm font-medium">Vibrations</span>
              </div>
              <Toggle
                checked={vibrationEnabled}
                onChange={toggleVibration}
                label="Activer ou désactiver les vibrations"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-[var(--color-text-muted)]" />
                <span className="text-sm font-medium">Écran allumé pendant une partie</span>
              </div>
              <Toggle
                checked={wakeLockEnabled}
                onChange={toggleWakeLock}
                label="Empêcher la mise en veille pendant une partie"
              />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Géographie</span>
          <Card className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">Nombre de questions par défaut</span>
              <div className="flex gap-2">
                {QUESTION_COUNTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setGeoQuestionCount(c)}
                    className={`flex-1 rounded-[var(--radius-md)] py-2 text-sm font-semibold transition-[transform,box-shadow] active:scale-95 ${
                      geoQuestionCount === c
                        ? 'bg-[var(--gradient-primary)] text-white shadow-[var(--glow-sm)]'
                        : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">Durée du défi chrono par défaut</span>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setGeoDuration(d)}
                    className={`flex-1 rounded-[var(--radius-md)] py-2 text-sm font-semibold transition-[transform,box-shadow] active:scale-95 ${
                      geoDuration === d
                        ? 'bg-[var(--gradient-primary)] text-white shadow-[var(--glow-sm)]'
                        : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {d / 60} min
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">
                Délai avant la question suivante
              </span>
              <div className="grid grid-cols-4 gap-2">
                {AUTO_ADVANCE_DELAYS_MS.map((ms) => (
                  <button
                    key={ms}
                    type="button"
                    onClick={() => setGeoAutoAdvanceDelayMs(ms)}
                    className={`rounded-[var(--radius-md)] py-2 text-sm font-semibold transition-[transform,box-shadow] active:scale-95 ${
                      geoAutoAdvanceDelayMs === ms
                        ? 'bg-[var(--gradient-primary)] text-white shadow-[var(--glow-sm)]'
                        : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {formatAutoAdvanceDelay(ms)}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {canInstall && (
          <div className="flex flex-col gap-2">
            <Card interactive className="flex cursor-pointer items-center gap-3" onClick={promptInstall}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--gradient-primary)] shadow-[var(--glow-sm)]">
                <Download size={20} color="white" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Installer l'application</p>
                <p className="text-xs text-[var(--color-text-muted)]">Accès rapide depuis votre écran d'accueil</p>
              </div>
              <ChevronRight size={18} className="text-[var(--color-text-muted)]" />
            </Card>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Application</span>
          <Card className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-raised)]">
                <Info size={20} className="text-[var(--color-text-muted)]" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Version {__APP_VERSION__}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {needRefresh
                    ? 'Une mise à jour est disponible'
                    : checking
                      ? 'Vérification en cours…'
                      : 'Application à jour'}
                </p>
              </div>
            </div>
            <Button variant="secondary" onClick={checkForUpdate} disabled={checking}>
              <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
              Vérifier les mises à jour
            </Button>
            {needRefresh && (
              <Button variant="primary" onClick={applyUpdate}>
                Redémarrer pour mettre à jour
              </Button>
            )}
          </Card>
        </div>

        <Button
          variant="secondary"
          className="mt-2 w-full text-[var(--color-danger)]"
          onClick={() => setShowResetConfirm(true)}
        >
          <RotateCcw size={16} />
          Réinitialiser les données
        </Button>
      </div>

      <Modal open={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-base font-semibold">
            Réinitialiser toutes les données ? Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowResetConfirm(false)}>
              Annuler
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleReset}>
              Réinitialiser
            </Button>
          </div>
        </div>
      </Modal>
    </ScreenTransition>
  )
}
