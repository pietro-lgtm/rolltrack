import { useEffect, useState } from 'react'
import { Calendar, Clock, Swords, Target } from 'lucide-react'

interface StatsGridProps {
  stats: {
    totalSessions: number
    totalHours: number
    sparringHours: number
    submissions: number
  }
}

function AnimatedNumber({ target, decimals = 0 }: { target: number; decimals?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const duration = 1200
    const steps = 40
    const stepTime = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(target * eased)
      if (step >= steps) {
        setCurrent(target)
        clearInterval(timer)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [target])

  return <>{decimals > 0 ? current.toFixed(decimals) : Math.round(current)}</>
}

const cards = [
  {
    key: 'totalSessions' as const,
    label: 'Total Sessions',
    icon: Calendar,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    key: 'totalHours' as const,
    label: 'Total Hours',
    icon: Clock,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    decimals: 1,
  },
  {
    key: 'sparringHours' as const,
    label: 'Sparring Hours',
    icon: Swords,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    decimals: 1,
  },
  {
    key: 'submissions' as const,
    label: 'Submissions',
    icon: Target,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
]

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ key, label, icon: Icon, color, bgColor, decimals }) => (
        <div
          key={key}
          className="bg-navy-800 rounded-2xl p-4 flex flex-col items-center text-center"
        >
          <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center mb-2`}>
            <Icon size={20} className={color} />
          </div>
          <div className="text-2xl font-bold tabular-nums">
            <AnimatedNumber target={stats[key]} decimals={decimals} />
          </div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
