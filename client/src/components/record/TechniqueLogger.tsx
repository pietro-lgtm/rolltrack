import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, Minus } from 'lucide-react'
import type { Technique, TechniqueCategory, PositionName } from '../../types'

interface TechniqueLoggerProps {
  techniques: Technique[]
  onChange: (techniques: Technique[]) => void
}

const COMMON_TECHNIQUES = [
  'Armbar',
  'Triangle',
  'RNC',
  'Kimura',
  'Americana',
  'Guillotine',
  'Omoplata',
  'Bow and Arrow',
  'Cross Collar',
  'Ezekiel',
  'Loop Choke',
  'Darce',
  'Anaconda',
  'Knee Bar',
  'Heel Hook',
  'Toe Hold',
  'Wrist Lock',
  'Scissor Sweep',
  'Hip Bump',
  'Flower Sweep',
  'Berimbolo',
  'Toreando Pass',
  'Knee Cut',
  'X-Pass',
  'Leg Drag',
  'Single Leg',
  'Double Leg',
  'Arm Drag',
  'Hip Escape',
  'Bridge and Roll',
  'Elbow Escape',
  'Granby Roll',
]

const CATEGORIES: TechniqueCategory[] = [
  'Submission',
  'Sweep',
  'Pass',
  'Takedown',
  'Escape',
  'Position',
]

const POSITIONS: PositionName[] = [
  'Closed Guard',
  'Half Guard',
  'Mount',
  'Back',
  'Side Control',
  'Open Guard',
  'Butterfly Guard',
  'De La Riva',
  'X Guard',
  'Turtle',
  'Standing',
  'North South',
]

function createTechnique(): Technique {
  return {
    id: `tech-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    category: 'Submission',
    position: 'Closed Guard',
    successes: 0,
    attempts: 0,
  }
}

function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string
  onChange: (val: string) => void
  suggestions: string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [filtered, setFiltered] = useState<string[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.length < 1) {
      setFiltered([])
      return
    }
    const lower = value.toLowerCase()
    setFiltered(
      suggestions.filter((s) => s.toLowerCase().includes(lower)).slice(0, 8)
    )
  }, [value, suggestions])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-navy-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-navy-700 rounded-lg border border-navy-600 shadow-xl overflow-hidden max-h-40 overflow-y-auto">
          {filtered.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                onChange(suggestion)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-navy-600 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (val: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider w-16">
        {label}
      </span>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center text-gray-500 hover:text-white hover:bg-navy-600 transition-colors active:scale-95"
      >
        <Minus size={12} />
      </button>
      <span className="text-sm font-mono font-semibold text-white w-6 text-center">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-lg bg-navy-700 flex items-center justify-center text-gray-500 hover:text-white hover:bg-navy-600 transition-colors active:scale-95"
      >
        <Plus size={12} />
      </button>
    </div>
  )
}

export default function TechniqueLogger({
  techniques,
  onChange,
}: TechniqueLoggerProps) {
  const addTechnique = () => {
    onChange([...techniques, createTechnique()])
  }

  const removeTechnique = (id: string) => {
    onChange(techniques.filter((t) => t.id !== id))
  }

  const updateTechnique = (id: string, changes: Partial<Technique>) => {
    onChange(
      techniques.map((t) => (t.id === id ? { ...t, ...changes } : t))
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">
          Techniques ({techniques.length})
        </h3>
        <button
          onClick={addTechnique}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-colors active:scale-95"
        >
          <Plus size={14} />
          Add Technique
        </button>
      </div>

      {techniques.map((tech) => (
        <div key={tech.id} className="bg-navy-800 rounded-xl p-3 space-y-3">
          {/* Header with delete */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Technique
            </span>
            <button
              onClick={() => removeTechnique(tech.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Name with autocomplete */}
          <AutocompleteInput
            value={tech.name}
            onChange={(name) => updateTechnique(tech.id, { name })}
            suggestions={COMMON_TECHNIQUES}
            placeholder="Technique name"
          />

          {/* Category */}
          <div className="relative">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Category
            </span>
            <div className="relative mt-1">
              <select
                value={tech.category}
                onChange={(e) =>
                  updateTechnique(tech.id, {
                    category: e.target.value as TechniqueCategory,
                  })
                }
                className="w-full appearance-none bg-navy-700 rounded-lg px-3 py-2 pr-8 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          {/* Position */}
          <div className="relative">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Position
            </span>
            <div className="relative mt-1">
              <select
                value={tech.position}
                onChange={(e) =>
                  updateTechnique(tech.id, {
                    position: e.target.value as PositionName,
                  })
                }
                className="w-full appearance-none bg-navy-700 rounded-lg px-3 py-2 pr-8 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          {/* Success / Attempts counters */}
          <div className="flex items-center gap-6">
            <Counter
              label="Success"
              value={tech.successes}
              onChange={(successes) =>
                updateTechnique(tech.id, { successes })
              }
            />
            <Counter
              label="Attempts"
              value={tech.attempts}
              onChange={(attempts) =>
                updateTechnique(tech.id, { attempts })
              }
            />
          </div>
        </div>
      ))}

      {techniques.length === 0 && (
        <div className="text-center py-6 text-sm text-gray-600">
          Track what you practiced. Tap &quot;Add Technique&quot; to begin.
        </div>
      )}
    </div>
  )
}
