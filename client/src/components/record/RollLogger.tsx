import { Plus, Trash2, ChevronDown } from 'lucide-react'
import type { Roll, RollResult } from '../../types'

interface RollLoggerProps {
  rolls: Roll[]
  onChange: (rolls: Roll[]) => void
}

const DURATION_OPTIONS = [5, 6, 7, 8, 10]

const RESULT_OPTIONS: { value: RollResult; label: string }[] = [
  { value: 'sub_win', label: 'Sub Win' },
  { value: 'sub_loss', label: 'Sub Loss' },
  { value: 'points_win', label: 'Pts Win' },
  { value: 'points_loss', label: 'Pts Loss' },
  { value: 'draw', label: 'Draw' },
  { value: 'positional', label: 'Positional' },
]

function createRoll(roundNumber: number): Roll {
  return {
    id: `roll-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    roundNumber,
    partnerName: '',
    durationMins: 6,
    result: 'draw',
  }
}

export default function RollLogger({ rolls, onChange }: RollLoggerProps) {
  const addRoll = () => {
    onChange([...rolls, createRoll(rolls.length + 1)])
  }

  const removeRoll = (id: string) => {
    const updated = rolls
      .filter((r) => r.id !== id)
      .map((r, i) => ({ ...r, roundNumber: i + 1 }))
    onChange(updated)
  }

  const updateRoll = (id: string, changes: Partial<Roll>) => {
    onChange(rolls.map((r) => (r.id === id ? { ...r, ...changes } : r)))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">
          Rolls ({rolls.length})
        </h3>
        <button
          onClick={addRoll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors active:scale-95"
        >
          <Plus size={14} />
          Add Round
        </button>
      </div>

      {rolls.map((roll) => {
        const isSubResult =
          roll.result === 'sub_win' || roll.result === 'sub_loss'

        return (
          <div
            key={roll.id}
            className="bg-navy-800 rounded-xl p-3 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Round {roll.roundNumber}
              </span>
              <button
                onClick={() => removeRoll(roll.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Partner name */}
            <input
              type="text"
              value={roll.partnerName}
              onChange={(e) =>
                updateRoll(roll.id, { partnerName: e.target.value })
              }
              placeholder="Partner name"
              className="w-full bg-navy-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
            />

            {/* Duration quick picks */}
            <div>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Duration (min)
              </span>
              <div className="flex gap-1.5 mt-1">
                {DURATION_OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    onClick={() =>
                      updateRoll(roll.id, { durationMins: mins })
                    }
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      roll.durationMins === mins
                        ? 'bg-blue-500 text-white'
                        : 'bg-navy-700 text-gray-500 hover:text-gray-400'
                    }`}
                  >
                    {mins}
                  </button>
                ))}
                {/* Custom */}
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={
                    DURATION_OPTIONS.includes(roll.durationMins)
                      ? ''
                      : roll.durationMins
                  }
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (val > 0) updateRoll(roll.id, { durationMins: val })
                  }}
                  placeholder="#"
                  className="w-12 py-1.5 rounded-lg bg-navy-700 text-xs text-center text-gray-400 placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            </div>

            {/* Result */}
            <div className="relative">
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Result
              </span>
              <div className="relative mt-1">
                <select
                  value={roll.result}
                  onChange={(e) =>
                    updateRoll(roll.id, {
                      result: e.target.value as RollResult,
                    })
                  }
                  className="w-full appearance-none bg-navy-700 rounded-lg px-3 py-2 pr-8 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50"
                >
                  {RESULT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

            {/* Submission type (if sub result) */}
            {isSubResult && (
              <input
                type="text"
                value={roll.submissionType ?? ''}
                onChange={(e) =>
                  updateRoll(roll.id, { submissionType: e.target.value })
                }
                placeholder="Submission type (e.g., armbar, triangle)"
                className="w-full bg-navy-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            )}
          </div>
        )
      })}

      {rolls.length === 0 && (
        <div className="text-center py-6 text-sm text-gray-600">
          No rolls recorded yet. Tap &quot;Add Round&quot; to log your sparring.
        </div>
      )}
    </div>
  )
}
