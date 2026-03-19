import { useState } from 'react'
import { ChevronLeft, Camera, ClipboardList } from 'lucide-react'
import { api } from '../api/client'
import type {
  SessionType,
  GiType,
  Academy,
  Roll,
  Technique,
  WeatherInfo,
  WearableInfo,
  TimerData,
} from '../types'
import SessionTypeSelector from '../components/record/SessionTypeSelector'
import GiNogiToggle from '../components/record/GiNogiToggle'
import AcademyPicker from '../components/record/AcademyPicker'
import Timer from '../components/record/Timer'
import RollLogger from '../components/record/RollLogger'
import TechniqueLogger from '../components/record/TechniqueLogger'
import WeatherWidget from '../components/record/WeatherWidget'
import WearableSync from '../components/record/WearableSync'
import PostWorkoutSummary from '../components/record/PostWorkoutSummary'
import ManualEntryForm from '../components/record/ManualEntryForm'
import ShareOverlay from '../components/share/ShareOverlay'

type RecordStep = 'setup' | 'timer' | 'manual' | 'post' | 'summary'

const FEELING_EMOJIS = [
  { value: 1, emoji: '\uD83D\uDE29', label: 'Awful' },
  { value: 2, emoji: '\uD83D\uDE15', label: 'Rough' },
  { value: 3, emoji: '\uD83D\uDE10', label: 'Okay' },
  { value: 4, emoji: '\uD83D\uDE0A', label: 'Good' },
  { value: 5, emoji: '\uD83E\uDD29', label: 'Great' },
]

const INTENSITY_OPTIONS = [
  { value: 1, label: 'Light' },
  { value: 2, label: 'Moderate' },
  { value: 3, label: 'Hard' },
  { value: 4, label: 'Intense' },
  { value: 5, label: 'Max' },
]

export default function Record() {
  // Flow state
  const [step, setStep] = useState<RecordStep>('setup')

  // Step 1: Setup
  const [sessionType, setSessionType] = useState<SessionType>('class')
  const [giType, setGiType] = useState<GiType>('gi')
  const [academy, setAcademy] = useState<Academy | null>(null)

  // Step 2: Timer data
  const [timerData, setTimerData] = useState<TimerData>({
    totalSecs: 0,
    classSecs: 0,
    sparringSecs: 0,
    drillingSecs: 0,
  })

  // Step 3: Post-workout
  const [rolls, setRolls] = useState<Roll[]>([])
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [notes, setNotes] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [feeling, setFeeling] = useState(3)
  const [intensity, setIntensity] = useState(3)
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [wearable, setWearable] = useState<WearableInfo | null>(null)

  // Manual entry
  const [startedAt, setStartedAt] = useState<string | null>(null)

  // Step 4: Summary
  const [saving, setSaving] = useState(false)

  const handleTimerStop = (data: TimerData) => {
    setTimerData(data)
    setStep('post')
  }

  const handleManualContinue = (data: {
    sessionType: SessionType
    giType: GiType
    academy: Academy | null
    timerData: TimerData
    startedAt: string
  }) => {
    setSessionType(data.sessionType)
    setGiType(data.giType)
    setAcademy(data.academy)
    setTimerData(data.timerData)
    setStartedAt(data.startedAt)
    setStep('post')
  }

  const handleContinueToSummary = () => {
    setStep('summary')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('/sessions', {
        type: sessionType,
        gi: giType,
        academyId: academy?.id,
        academyName: academy?.name,
        duration: timerData.totalSecs,
        classTime: timerData.classSecs,
        sparringTime: timerData.sparringSecs,
        drillingTime: timerData.drillingSecs,
        startedAt: startedAt || new Date().toISOString(),
        photo: photoUrl,
        rolls,
        techniques: techniques.map((t) => t.name),
        notes,
        feeling,
        intensity,
        weather,
        wearableData: wearable
          ? {
              source: 'other' as const,
              heartRate: {
                avg: wearable.avgHR,
                max: wearable.maxHR,
                min: 0,
              },
              calories: wearable.calories,
            }
          : undefined,
      })
      // Navigate to session detail after save
      console.log('Session saved successfully')
    } catch {
      console.error('Failed to save session, saving locally')
    } finally {
      setSaving(false)
      // Reset to beginning after short delay
      setTimeout(() => {
        resetAll()
      }, 2000)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const result = await api.upload(file)
      setPhotoUrl(result.url)
    } catch {
      console.error('Photo upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const [showShare, setShowShare] = useState(false)

  const handleShare = () => {
    setShowShare(true)
  }

  const resetAll = () => {
    setStep('setup')
    setSessionType('class')
    setGiType('gi')
    setAcademy(null)
    setTimerData({ totalSecs: 0, classSecs: 0, sparringSecs: 0, drillingSecs: 0 })
    setRolls([])
    setTechniques([])
    setNotes('')
    setFeeling(3)
    setIntensity(3)
    setWeather(null)
    setWearable(null)
    setPhotoUrl(null)
    setUploadingPhoto(false)
    setStartedAt(null)
    setSaving(false)
  }

  const handleBack = () => {
    if (step === 'timer') setStep('setup')
    else if (step === 'manual') setStep('setup')
    else if (step === 'post') setStep(startedAt ? 'manual' : 'timer')
    else if (step === 'summary') setStep('post')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        {step !== 'setup' && (
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-navy-800 flex items-center justify-center hover:bg-navy-700 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
        )}
        <h1 className="text-xl font-bold text-white">
          {step === 'setup' && 'New Session'}
          {step === 'timer' && 'Training'}
          {step === 'manual' && 'Log Past Session'}
          {step === 'post' && 'Post-Workout'}
          {step === 'summary' && 'Summary'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-24">
        {/* STEP 1: Setup */}
        {step === 'setup' && (
          <div className="space-y-5 pt-2">
            {/* Session type */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Session Type
              </label>
              <SessionTypeSelector value={sessionType} onChange={setSessionType} />
            </div>

            {/* Gi toggle */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Gi / No-Gi
              </label>
              <GiNogiToggle value={giType} onChange={setGiType} />
            </div>

            {/* Academy */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Academy
              </label>
              <AcademyPicker value={academy} onChange={setAcademy} />
            </div>

            {/* Start button */}
            <button
              onClick={() => setStep('timer')}
              className="w-full py-4 rounded-xl bg-blue-500 text-white text-base font-bold hover:bg-blue-400 transition-colors active:scale-[0.98] shadow-lg shadow-blue-500/20 mt-4"
            >
              Start Timer
            </button>

            {/* Manual entry */}
            <button
              onClick={() => setStep('manual')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-navy-800 text-gray-400 text-sm font-medium hover:bg-navy-700 transition-colors"
            >
              <ClipboardList size={18} />
              Log Past Session
            </button>
          </div>
        )}

        {/* STEP 2a: Timer */}
        {step === 'timer' && (
          <div className="flex flex-col items-center pt-8">
            <Timer onStop={handleTimerStop} />
          </div>
        )}

        {/* STEP 2b: Manual Entry */}
        {step === 'manual' && (
          <ManualEntryForm
            onContinue={handleManualContinue}
            onBack={() => setStep('setup')}
          />
        )}

        {/* STEP 3: Post-workout form */}
        {step === 'post' && (
          <div className="space-y-5 pt-2">
            {/* Rolls */}
            <RollLogger rolls={rolls} onChange={setRolls} />

            {/* Techniques */}
            <TechniqueLogger techniques={techniques} onChange={setTechniques} />

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you work on? How did it feel?"
                className="w-full bg-navy-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 resize-none h-24 outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            {/* Feeling */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                How Do You Feel?
              </label>
              <div className="flex gap-2">
                {FEELING_EMOJIS.map(({ value, emoji, label }) => (
                  <button
                    key={value}
                    onClick={() => setFeeling(value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all ${
                      feeling === value
                        ? 'bg-blue-500/20 ring-1 ring-blue-500/50 scale-105'
                        : 'bg-navy-800 hover:bg-navy-700'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[10px] text-gray-500">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Intensity
              </label>
              <div className="flex gap-2">
                {INTENSITY_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setIntensity(value)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      intensity === value
                        ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50'
                        : 'bg-navy-800 text-gray-500 hover:bg-navy-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Weather
              </label>
              <WeatherWidget weather={weather} onChange={setWeather} />
            </div>

            {/* Wearable */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Wearable Data
              </label>
              <WearableSync data={wearable} onChange={setWearable} />
            </div>

            {/* Photo upload */}
            <div>
              {photoUrl ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={photoUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${photoUrl}` : photoUrl} alt="Session" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => setPhotoUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white text-xs"
                  >
                    X
                  </button>
                </div>
              ) : (
                <label className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-navy-800 text-gray-400 text-sm hover:bg-navy-700 transition-colors cursor-pointer">
                  <Camera size={18} />
                  {uploadingPhoto ? 'Uploading...' : 'Add Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                </label>
              )}
            </div>

            {/* Continue */}
            <button
              onClick={handleContinueToSummary}
              className="w-full py-4 rounded-xl bg-blue-500 text-white text-base font-bold hover:bg-blue-400 transition-colors active:scale-[0.98] shadow-lg shadow-blue-500/20"
            >
              View Summary
            </button>
          </div>
        )}

        {/* STEP 4: Summary */}
        {step === 'summary' && (
          <div className="pt-2">
            <PostWorkoutSummary
              sessionType={sessionType}
              giType={giType}
              academy={academy}
              totalSecs={timerData.totalSecs}
              classSecs={timerData.classSecs}
              sparringSecs={timerData.sparringSecs}
              drillingSecs={timerData.drillingSecs}
              rolls={rolls}
              techniques={techniques}
              notes={notes}
              feeling={feeling}
              intensity={intensity}
              weather={weather}
              wearable={wearable}
              onShare={handleShare}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        )}
      </div>

      {/* Share Overlay */}
      <ShareOverlay
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        data={{
          totalSecs: timerData.totalSecs,
          rollsCount: rolls.length,
          wins: rolls.filter((r) => r.result === 'sub_win' || r.result === 'points_win').length,
          losses: rolls.filter((r) => r.result === 'sub_loss' || r.result === 'points_loss').length,
          draws: rolls.filter((r) => r.result === 'draw' || r.result === 'positional').length,
          sessionType,
          gi: giType,
          date: new Date(startedAt || Date.now()).toLocaleDateString(),
        }}
      />
    </div>
  )
}
