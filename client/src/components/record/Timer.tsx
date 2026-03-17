import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'
import type { TimerData } from '../../types'

type TimerPhase = 'class' | 'sparring' | 'drilling'
type TimerState = 'idle' | 'running' | 'paused' | 'stopped'

interface TimerProps {
  onStop: (data: TimerData) => void
}

const PHASE_CONFIG: Record<
  TimerPhase,
  { label: string; color: string; ring: string; bg: string }
> = {
  class: {
    label: 'CLASS',
    color: 'text-blue-400',
    ring: 'border-blue-500',
    bg: 'bg-blue-500',
  },
  sparring: {
    label: 'SPARRING',
    color: 'text-red-400',
    ring: 'border-red-500',
    bg: 'bg-red-500',
  },
  drilling: {
    label: 'DRILLING',
    color: 'text-amber-400',
    ring: 'border-amber-500',
    bg: 'bg-amber-500',
  },
}

const PHASES: TimerPhase[] = ['class', 'sparring', 'drilling']

function formatMmSs(totalMs: number): string {
  const totalSecs = Math.floor(totalMs / 1000)
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function Timer({ onStop }: TimerProps) {
  const [state, setState] = useState<TimerState>('idle')
  const [phase, setPhase] = useState<TimerPhase>('class')
  const [elapsed, setElapsed] = useState(0)
  const [phaseTimes, setPhaseTimes] = useState({
    class: 0,
    sparring: 0,
    drilling: 0,
  })

  const startTimeRef = useRef(0)
  const accumulatedRef = useRef(0)
  const phaseTimesRef = useRef({ class: 0, sparring: 0, drilling: 0 })
  const phaseStartRef = useRef(0)
  const phaseAccumulatedRef = useRef(0)
  const currentPhaseRef = useRef<TimerPhase>('class')
  const rafRef = useRef<number>(0)

  const tick = useCallback(() => {
    const now = performance.now()
    const totalElapsed = accumulatedRef.current + (now - startTimeRef.current)
    const phaseElapsed =
      phaseAccumulatedRef.current + (now - phaseStartRef.current)

    setElapsed(totalElapsed)

    const newPhaseTimes = { ...phaseTimesRef.current }
    newPhaseTimes[currentPhaseRef.current] = phaseElapsed
    phaseTimesRef.current = newPhaseTimes
    setPhaseTimes({ ...newPhaseTimes })

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handlePlay = () => {
    if (state === 'idle') {
      setState('running')
      startTimeRef.current = performance.now()
      phaseStartRef.current = performance.now()
      accumulatedRef.current = 0
      phaseAccumulatedRef.current = 0
      currentPhaseRef.current = 'class'
      setPhase('class')
      rafRef.current = requestAnimationFrame(tick)
    } else if (state === 'paused') {
      setState('running')
      startTimeRef.current = performance.now()
      phaseStartRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    }
  }

  const handlePause = () => {
    if (state === 'running') {
      setState('paused')
      cancelAnimationFrame(rafRef.current)
      const now = performance.now()
      accumulatedRef.current += now - startTimeRef.current
      phaseAccumulatedRef.current += now - phaseStartRef.current
    }
  }

  const handleStop = () => {
    if (state === 'running') {
      cancelAnimationFrame(rafRef.current)
      const now = performance.now()
      accumulatedRef.current += now - startTimeRef.current
      phaseAccumulatedRef.current += now - phaseStartRef.current
      const finalPhaseTimes = { ...phaseTimesRef.current }
      finalPhaseTimes[currentPhaseRef.current] = phaseAccumulatedRef.current
      phaseTimesRef.current = finalPhaseTimes
      setPhaseTimes({ ...finalPhaseTimes })
    } else if (state === 'paused') {
      // Already accumulated
    }

    setState('stopped')
    onStop({
      totalSecs: Math.floor(accumulatedRef.current / 1000),
      classSecs: Math.floor(phaseTimesRef.current.class / 1000),
      sparringSecs: Math.floor(phaseTimesRef.current.sparring / 1000),
      drillingSecs: Math.floor(phaseTimesRef.current.drilling / 1000),
    })
  }

  const handleSwitchPhase = () => {
    if (state !== 'running') return

    cancelAnimationFrame(rafRef.current)
    const now = performance.now()

    // Save current phase time
    phaseAccumulatedRef.current += now - phaseStartRef.current
    const updatedTimes = { ...phaseTimesRef.current }
    updatedTimes[currentPhaseRef.current] = phaseAccumulatedRef.current
    phaseTimesRef.current = updatedTimes

    // Switch to next phase
    const currentIndex = PHASES.indexOf(currentPhaseRef.current)
    const nextPhase = PHASES[(currentIndex + 1) % PHASES.length]
    currentPhaseRef.current = nextPhase
    setPhase(nextPhase)

    // Start tracking new phase
    phaseAccumulatedRef.current = phaseTimesRef.current[nextPhase]
    phaseStartRef.current = performance.now()
    startTimeRef.current = performance.now()
    accumulatedRef.current = accumulatedRef.current + (now - startTimeRef.current)
    startTimeRef.current = performance.now()

    rafRef.current = requestAnimationFrame(tick)
  }

  const config = PHASE_CONFIG[phase]

  // Ring progress for visual flair (one revolution per minute)
  const totalSecs = Math.floor(elapsed / 1000)
  const progressDeg = (totalSecs % 60) * 6

  return (
    <div className="flex flex-col items-center">
      {/* Circular timer */}
      <div className="relative mb-6">
        {/* Background ring */}
        <div
          className={`w-52 h-52 rounded-full border-[6px] flex flex-col items-center justify-center transition-colors duration-500 ${
            state === 'idle' ? 'border-navy-700' : config.ring
          }`}
          style={
            state === 'running'
              ? {
                  background: `conic-gradient(${
                    phase === 'class'
                      ? '#3b82f6'
                      : phase === 'sparring'
                      ? '#ef4444'
                      : '#f59e0b'
                  } ${progressDeg}deg, transparent ${progressDeg}deg)`,
                  WebkitMask:
                    'radial-gradient(farthest-side, transparent calc(100% - 6px), white calc(100% - 6px))',
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), white calc(100% - 6px))',
                }
              : undefined
          }
        >
          <div className="absolute inset-[6px] rounded-full bg-gray-900 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold tracking-wider text-white">
              {formatMmSs(elapsed)}
            </span>
            {state !== 'idle' && (
              <span
                className={`text-xs font-semibold mt-1 tracking-widest ${config.color}`}
              >
                {config.label}
              </span>
            )}
            {state === 'idle' && (
              <span className="text-xs text-gray-600 mt-1">TAP TO START</span>
            )}
          </div>
        </div>
      </div>

      {/* Phase time breakdown */}
      {state !== 'idle' && (
        <div className="flex gap-4 mb-5 text-xs">
          {PHASES.map((p) => {
            const cfg = PHASE_CONFIG[p]
            const active = phase === p && state === 'running'
            return (
              <div
                key={p}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  active ? 'bg-navy-800' : ''
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${cfg.bg} ${active ? 'animate-pulse' : 'opacity-50'}`} />
                <span className={`font-medium ${active ? cfg.color : 'text-gray-500'}`}>
                  {formatMmSs(phaseTimes[p])}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {state === 'idle' && (
          <button
            onClick={handlePlay}
            className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-400 transition-colors active:scale-95"
          >
            <Play size={28} className="text-white ml-1" />
          </button>
        )}

        {(state === 'running' || state === 'paused') && (
          <>
            {/* Pause/Resume */}
            <button
              onClick={state === 'running' ? handlePause : handlePlay}
              className="w-14 h-14 rounded-full bg-navy-700 flex items-center justify-center hover:bg-navy-600 transition-colors active:scale-95"
            >
              {state === 'running' ? (
                <Pause size={22} className="text-white" />
              ) : (
                <Play size={22} className="text-white ml-0.5" />
              )}
            </button>

            {/* Switch Phase */}
            <button
              onClick={handleSwitchPhase}
              disabled={state !== 'running'}
              className={`
                px-4 py-3 rounded-xl text-xs font-semibold transition-all active:scale-95
                ${
                  state === 'running'
                    ? `${config.bg}/20 ${config.color} ring-1 ring-current/30`
                    : 'bg-navy-700 text-gray-500'
                }
              `}
            >
              <RotateCcw size={14} className="inline mr-1" />
              Phase
            </button>

            {/* Stop */}
            <button
              onClick={handleStop}
              className="w-14 h-14 rounded-full bg-navy-700 flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors active:scale-95"
            >
              <Square size={22} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
