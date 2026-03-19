import { useState } from 'react'
import type { SessionType, GiType, Academy, TimerData } from '../../types'
import SessionTypeSelector from './SessionTypeSelector'
import GiNogiToggle from './GiNogiToggle'
import AcademyPicker from './AcademyPicker'

interface ManualEntryFormProps {
  onContinue: (data: {
    sessionType: SessionType
    giType: GiType
    academy: Academy | null
    timerData: TimerData
    startedAt: string
  }) => void
  onBack: () => void
}

export default function ManualEntryForm({ onContinue, onBack }: ManualEntryFormProps) {
  const [sessionType, setSessionType] = useState<SessionType>('class')
  const [giType, setGiType] = useState<GiType>('gi')
  const [academy, setAcademy] = useState<Academy | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('18:00')
  const [hours, setHours] = useState(1)
  const [minutes, setMinutes] = useState(30)

  // Phase split (approximate %)
  const [classPercent, setClassPercent] = useState(50)
  const [sparringPercent, setSparringPercent] = useState(35)

  const totalSecs = (hours * 60 + minutes) * 60
  const drillingPercent = Math.max(0, 100 - classPercent - sparringPercent)

  const handleSubmit = () => {
    if (totalSecs <= 0) return

    const classSecs = Math.round(totalSecs * (classPercent / 100))
    const sparringSecs = Math.round(totalSecs * (sparringPercent / 100))
    const drillingSecs = totalSecs - classSecs - sparringSecs

    const startedAt = new Date(`${date}T${startTime}:00`).toISOString()

    onContinue({
      sessionType,
      giType,
      academy,
      timerData: {
        totalSecs,
        classSecs,
        sparringSecs,
        drillingSecs,
      },
      startedAt,
    })
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-navy-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Duration
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-navy-800 rounded-xl px-3 py-2.5">
            <input
              type="number"
              min={0}
              max={8}
              value={hours}
              onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-10 bg-transparent text-sm text-white text-center outline-none"
            />
            <span className="text-xs text-gray-500">hr</span>
          </div>
          <div className="flex items-center gap-1.5 bg-navy-800 rounded-xl px-3 py-2.5">
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-10 bg-transparent text-sm text-white text-center outline-none"
            />
            <span className="text-xs text-gray-500">min</span>
          </div>
        </div>
      </div>

      {/* Session Type */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Session Type
        </label>
        <SessionTypeSelector value={sessionType} onChange={setSessionType} />
      </div>

      {/* Gi Toggle */}
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

      {/* Phase Split */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
          Time Split (approximate)
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-400 w-16">Class</span>
            <input
              type="range"
              min={0}
              max={100}
              value={classPercent}
              onChange={(e) => {
                const v = parseInt(e.target.value)
                setClassPercent(v)
                if (v + sparringPercent > 100) setSparringPercent(100 - v)
              }}
              className="flex-1 accent-blue-500"
            />
            <span className="text-xs text-gray-400 w-10 text-right">{classPercent}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-red-400 w-16">Sparring</span>
            <input
              type="range"
              min={0}
              max={100}
              value={sparringPercent}
              onChange={(e) => {
                const v = parseInt(e.target.value)
                setSparringPercent(v)
                if (classPercent + v > 100) setClassPercent(100 - v)
              }}
              className="flex-1 accent-red-500"
            />
            <span className="text-xs text-gray-400 w-10 text-right">{sparringPercent}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-yellow-400 w-16">Drilling</span>
            <div className="flex-1 h-2 bg-navy-800 rounded-full">
              <div className="h-full bg-yellow-500/50 rounded-full" style={{ width: `${drillingPercent}%` }} />
            </div>
            <span className="text-xs text-gray-400 w-10 text-right">{drillingPercent}%</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl bg-navy-800 text-gray-400 text-base font-medium hover:bg-navy-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={totalSecs <= 0}
          className="flex-1 py-4 rounded-xl bg-blue-500 text-white text-base font-bold hover:bg-blue-400 transition-colors active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
