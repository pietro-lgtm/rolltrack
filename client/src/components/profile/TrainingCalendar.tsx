import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  getDay,
} from 'date-fns'

interface SessionEntry {
  date: string
  duration_secs: number
}

interface TrainingCalendarProps {
  sessions: SessionEntry[]
  onDayClick?: (date: Date, daySessions: SessionEntry[]) => void
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getIntensityClass(totalSecs: number): string {
  if (totalSecs === 0) return 'bg-navy-700/50'
  if (totalSecs < 1800) return 'bg-accent/20'
  if (totalSecs < 3600) return 'bg-accent/40'
  if (totalSecs < 5400) return 'bg-accent/65'
  return 'bg-accent'
}

export default function TrainingCalendar({ sessions, onDayClick }: TrainingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const sessionMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of sessions) {
      const key = format(new Date(s.date), 'yyyy-MM-dd')
      map[key] = (map[key] || 0) + s.duration_secs
    }
    return map
  }, [sessions])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    if (onDayClick) {
      const key = format(day, 'yyyy-MM-dd')
      const daySessions = sessions.filter(
        (s) => format(new Date(s.date), 'yyyy-MM-dd') === key
      )
      onDayClick(day, daySessions)
    }
  }

  const selectedDaySessions = useMemo(() => {
    if (!selectedDate) return []
    const key = format(selectedDate, 'yyyy-MM-dd')
    return sessions.filter(
      (s) => format(new Date(s.date), 'yyyy-MM-dd') === key
    )
  }, [selectedDate, sessions])

  return (
    <div className="bg-navy-800 rounded-2xl p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-navy-700 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-navy-700 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-[10px] text-gray-500 text-center font-medium py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const totalSecs = sessionMap[key] || 0
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)
          const selected = selectedDate && isSameDay(day, selectedDate)

          return (
            <button
              key={key}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                transition-all duration-150
                ${!inMonth ? 'opacity-20' : ''}
                ${getIntensityClass(inMonth ? totalSecs : 0)}
                ${today ? 'ring-1 ring-accent/60' : ''}
                ${selected ? 'ring-2 ring-white scale-110' : ''}
                hover:scale-105
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="mt-4 pt-3 border-t border-navy-600">
          <div className="text-xs text-gray-400 mb-2">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </div>
          {selectedDaySessions.length === 0 ? (
            <p className="text-xs text-gray-500">No training this day</p>
          ) : (
            <div className="space-y-1.5">
              {selectedDaySessions.map((s, i) => {
                const h = Math.floor(s.duration_secs / 3600)
                const m = Math.floor((s.duration_secs % 3600) / 60)
                const label = h > 0 ? `${h}h ${m}m` : `${m}m`
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-navy-700 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm font-medium">Session</span>
                    <span className="text-sm text-accent font-mono">{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
