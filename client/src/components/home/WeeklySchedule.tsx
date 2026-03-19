import { useState, useEffect, useMemo } from 'react'
import { CheckCircle } from 'lucide-react'
import { api } from '../../api/client'

interface ScheduleItem {
  id: string
  dayOfWeek: number
  type?: string
  sessionType?: string
  gi?: string
  startTime?: string
}

function getWeekDates(): Date[] {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const DAY_ABBRS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WeeklySchedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set())
  const weekDates = useMemo(() => getWeekDates(), [])
  const today = new Date()

  useEffect(() => {
    // Fetch schedule
    api.get<{ data: ScheduleItem[] }>('/schedule')
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.data || []
        setSchedule(items)
      })
      .catch(() => {
        setSchedule([])
      })

    // Fetch this week's sessions to mark completed days
    api.get<{ data: any[] }>('/sessions?limit=20')
      .then((res) => {
        const sessions = Array.isArray(res) ? res : res?.data || []
        const days = new Set<string>()
        sessions.forEach((s: any) => {
          const d = new Date(s.startedAt || s.createdAt)
          days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
        })
        setCompletedDays(days)
      })
      .catch(() => {
        setCompletedDays(new Set())
      })
  }, [])

  // Map schedule by day of week (API uses 0=Sunday, we display Mon=0)
  const scheduledDayMap = useMemo(() => {
    const map = new Map<number, ScheduleItem>()
    schedule.forEach((entry) => {
      // Convert: API 0=Sun,1=Mon..6=Sat → display 0=Mon..6=Sun
      const displayDay = entry.dayOfWeek === 0 ? 6 : entry.dayOfWeek - 1
      map.set(displayDay, entry)
    })
    return map
  }, [schedule])

  function isToday(date: Date) {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  function isCompleted(date: Date) {
    return completedDays.has(
      `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    )
  }

  return (
    <div className="px-1">
      <div className="flex justify-between gap-1">
        {weekDates.map((date, i) => {
          const entry = scheduledDayMap.get(i)
          const completed = isCompleted(date)
          const todayHighlight = isToday(date)
          const giNogi = entry?.gi || ''

          return (
            <button
              key={i}
              className={`
                relative flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl flex-1 transition-all
                ${todayHighlight
                  ? 'ring-2 ring-blue-500 bg-gray-800/80'
                  : 'bg-gray-800/40 hover:bg-gray-800/70'
                }
              `}
            >
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                {DAY_ABBRS[i]}
              </span>
              <span
                className={`text-sm font-semibold ${
                  todayHighlight ? 'text-white' : 'text-gray-300'
                }`}
              >
                {date.getDate()}
              </span>

              {/* Scheduled dot */}
              {entry && !completed && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    giNogi === 'gi'
                      ? 'bg-blue-500'
                      : giNogi === 'nogi' || giNogi === 'no_gi'
                      ? 'bg-purple-500'
                      : 'bg-green-500'
                  }`}
                />
              )}

              {/* Completed checkmark */}
              {completed && (
                <CheckCircle size={14} className="text-green-400" />
              )}

              {/* Empty spacer when nothing */}
              {!entry && !completed && <span className="h-3.5" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
