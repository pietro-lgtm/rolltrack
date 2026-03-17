import {
  BookOpen,
  Swords,
  Target,
  Trophy,
  GraduationCap,
} from 'lucide-react'
import type { SessionType } from '../../types'

interface SessionTypeSelectorProps {
  value: SessionType
  onChange: (type: SessionType) => void
}

const SESSION_TYPES: {
  value: SessionType
  label: string
  icon: React.ElementType
}[] = [
  { value: 'class', label: 'Class', icon: BookOpen },
  { value: 'open_mat', label: 'Open Mat', icon: Swords },
  { value: 'drilling', label: 'Drilling', icon: Target },
  { value: 'competition', label: 'Comp', icon: Trophy },
  { value: 'private', label: 'Private', icon: GraduationCap },
]

export default function SessionTypeSelector({
  value,
  onChange,
}: SessionTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      {SESSION_TYPES.map(({ value: type, label, icon: Icon }) => {
        const selected = value === type
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`
              flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all
              ${
                selected
                  ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-navy-800 text-gray-500 hover:bg-navy-700 hover:text-gray-400'
              }
            `}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
