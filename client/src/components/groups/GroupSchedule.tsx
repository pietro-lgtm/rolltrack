import { useEffect, useState } from 'react'
import { Calendar, Clock, User, AlertCircle } from 'lucide-react'
import { api } from '../../api/client'
import type { AcademyScheduleEntry } from '../../types'

interface GroupScheduleProps {
  groupId: string
  academyId?: string
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const classTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  gi: { label: 'Gi', color: 'text-blue-300', bg: 'bg-blue-500/20' },
  nogi: { label: 'No-Gi', color: 'text-orange-300', bg: 'bg-orange-500/20' },
  open_mat: { label: 'Open Mat', color: 'text-green-300', bg: 'bg-green-500/20' },
  fundamentals: { label: 'Fundamentals', color: 'text-purple-300', bg: 'bg-purple-500/20' },
  advanced: { label: 'Advanced', color: 'text-red-300', bg: 'bg-red-500/20' },
  competition: { label: 'Competition', color: 'text-yellow-300', bg: 'bg-yellow-500/20' },
  kids: { label: 'Kids', color: 'text-cyan-300', bg: 'bg-cyan-500/20' },
  private: { label: 'Private', color: 'text-gray-300', bg: 'bg-gray-500/20' },
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

interface AcademyDetailResponse {
  id: string
  name: string
  schedules?: AcademyScheduleEntry[]
}

export default function GroupSchedule({ groupId, academyId }: GroupScheduleProps) {
  const [schedules, setSchedules] = useState<AcademyScheduleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!academyId) {
        setLoading(false)
        return
      }

      try {
        const data = await api.get<AcademyDetailResponse>(`/academies/${academyId}`)
        setSchedules(data.schedules || [])
      } catch {
        setError('Could not load schedule')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [groupId, academyId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!academyId) {
    return (
      <div className="text-center py-12">
        <Calendar size={32} className="mx-auto text-gray-600 mb-3" />
        <p className="text-gray-400 text-sm">No academy linked to this group</p>
        <p className="text-gray-500 text-xs mt-1">Schedule is available for academy groups</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={32} className="mx-auto text-red-400 mb-3" />
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={32} className="mx-auto text-gray-600 mb-3" />
        <p className="text-gray-400 text-sm">No schedule available</p>
      </div>
    )
  }

  // Group by day of week
  const byDay: Record<number, AcademyScheduleEntry[]> = {}
  for (const entry of schedules) {
    const day = entry.dayOfWeek
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(entry)
  }

  // Sort entries within each day by start time
  for (const day of Object.keys(byDay)) {
    byDay[Number(day)].sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return (
    <div className="space-y-3">
      {DAY_NAMES.map((dayName, dayIndex) => {
        const entries = byDay[dayIndex]
        if (!entries || entries.length === 0) return null

        return (
          <div key={dayIndex} className="bg-navy-800 rounded-xl border border-navy-700 overflow-hidden">
            {/* Day header */}
            <div className="px-4 py-2.5 bg-navy-700/50 border-b border-navy-700">
              <h3 className="text-sm font-semibold text-white">{dayName}</h3>
              <p className="text-[10px] text-gray-500">{entries.length} class{entries.length !== 1 ? 'es' : ''}</p>
            </div>

            {/* Classes for this day */}
            <div className="divide-y divide-navy-700/50">
              {entries.map((entry, idx) => {
                const config = classTypeConfig[entry.classType] || {
                  label: entry.classType,
                  color: 'text-gray-300',
                  bg: 'bg-gray-500/20',
                }

                return (
                  <div key={idx} className="px-4 py-3 flex items-center gap-3">
                    {/* Time */}
                    <div className="flex-shrink-0 w-20">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Clock size={12} className="text-gray-500" />
                        <span>{formatTime(entry.startTime)}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 ml-[18px]">
                        to {formatTime(entry.endTime)}
                      </p>
                    </div>

                    {/* Class type badge */}
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${config.color} ${config.bg}`}>
                      {config.label}
                    </span>

                    {/* Instructor */}
                    {entry.instructor && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                        <User size={12} />
                        <span>{entry.instructor}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="bg-navy-800 rounded-xl p-3 border border-navy-700">
        <p className="text-[10px] text-gray-500 font-medium mb-2 uppercase tracking-wider">Class Types</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(classTypeConfig)
            .filter(([key]) => schedules.some((s) => s.classType === key))
            .map(([key, config]) => (
              <span key={key} className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${config.color} ${config.bg}`}>
                {config.label}
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}
