import type { GiType } from '../../types'

interface GiNogiToggleProps {
  value: GiType
  onChange: (type: GiType) => void
}

const OPTIONS: { value: GiType; label: string }[] = [
  { value: 'gi', label: 'Gi' },
  { value: 'nogi', label: 'No-Gi' },
  { value: 'both', label: 'Both' },
]

export default function GiNogiToggle({ value, onChange }: GiNogiToggleProps) {
  const selectedIndex = OPTIONS.findIndex((o) => o.value === value)

  return (
    <div className="relative flex bg-navy-800 rounded-xl p-1">
      {/* Sliding pill */}
      <div
        className="absolute top-1 bottom-1 rounded-lg bg-blue-500 transition-all duration-300 ease-out"
        style={{
          width: `calc(${100 / OPTIONS.length}% - 2px)`,
          left: `calc(${(selectedIndex * 100) / OPTIONS.length}% + 1px)`,
        }}
      />

      {OPTIONS.map(({ value: type, label }) => {
        const selected = value === type
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`
              relative z-10 flex-1 py-2 text-sm font-semibold text-center rounded-lg transition-colors duration-200
              ${selected ? 'text-white' : 'text-gray-500 hover:text-gray-400'}
            `}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
