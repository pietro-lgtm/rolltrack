interface FilterBarProps {
  filters: Record<string, boolean>
  onChange: (filters: Record<string, boolean>) => void
}

const filterOptions = [
  { key: 'open_mat', label: 'Open Mat', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { key: 'drop_in', label: 'Drop-Ins', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { key: 'gi', label: 'Gi Classes', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { key: 'nogi', label: 'No-Gi Classes', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
]

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  function toggle(key: string) {
    onChange({ ...filters, [key]: !filters[key] })
  }

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 px-1">
      {filterOptions.map(({ key, label, color }) => {
        const active = filters[key]
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              active
                ? color
                : 'bg-navy-800/80 text-gray-400 border-navy-600 hover:border-gray-500'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
