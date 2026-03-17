import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Calendar,
  DollarSign,
  CircleDot,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { api } from '../api/client'
import type { Academy, ClassScheduleEntry } from '../types'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const classTypeColors: Record<string, string> = {
  'Fundamentals': 'bg-blue-500/20 text-blue-400',
  'Advanced': 'bg-purple-500/20 text-purple-400',
  'No-Gi': 'bg-orange-500/20 text-orange-400',
  'Gi': 'bg-cyan-500/20 text-cyan-400',
  'Open Mat': 'bg-green-500/20 text-green-400',
  'Competition': 'bg-red-500/20 text-red-400',
  'Kids': 'bg-yellow-500/20 text-yellow-400',
}

function getClassColor(type: string): string {
  return classTypeColors[type] || 'bg-gray-500/20 text-gray-400'
}

export default function AcademyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [academy, setAcademy] = useState<Academy | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Academy>(`/academies/${id}`)
        setAcademy(data)
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!academy) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-400">Academy not found</p>
        <button onClick={() => navigate('/map')} className="text-accent text-sm">
          Back to Map
        </button>
      </div>
    )
  }

  // Group class schedule by day
  const scheduleByDay: Record<string, ClassScheduleEntry[]> = {}
  if (academy.classSchedule) {
    academy.classSchedule.forEach((entry) => {
      if (!scheduleByDay[entry.day]) scheduleByDay[entry.day] = []
      scheduleByDay[entry.day].push(entry)
    })
  }

  return (
    <div className="min-h-full pb-24">
      {/* Banner */}
      <div className="relative h-48 overflow-hidden">
        {academy.bannerImage ? (
          <img src={academy.bannerImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/30 via-navy-700 to-navy-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate('/map')}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-navy-900/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-navy-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Academy info */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-navy-800 rounded-2xl p-5 border border-navy-600 shadow-xl">
          <h1 className="text-2xl font-bold text-white">{academy.name}</h1>

          {academy.affiliation && (
            <span className="inline-block mt-2 px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
              {academy.affiliation}
            </span>
          )}

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <MapPin size={16} className="text-gray-500 flex-shrink-0" />
              <span>{academy.address}</span>
            </div>

            {academy.phone && (
              <a href={`tel:${academy.phone}`} className="flex items-center gap-3 text-sm text-gray-300 hover:text-accent transition-colors">
                <Phone size={16} className="text-gray-500 flex-shrink-0" />
                <span>{academy.phone}</span>
              </a>
            )}

            {academy.website && (
              <a
                href={academy.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-accent transition-colors"
              >
                <Globe size={16} className="text-gray-500 flex-shrink-0" />
                <span className="truncate">{academy.website}</span>
                <ExternalLink size={12} className="text-gray-500 flex-shrink-0" />
              </a>
            )}

            {academy.instagram && (
              <a
                href={`https://instagram.com/${academy.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-accent transition-colors"
              >
                <Instagram size={16} className="text-gray-500 flex-shrink-0" />
                <span>{academy.instagram}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Class Schedule */}
      {academy.classSchedule && academy.classSchedule.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-accent" />
            Class Schedule
          </h2>
          <div className="bg-navy-800 rounded-2xl border border-navy-600 overflow-hidden">
            {days.map((day) => {
              const entries = scheduleByDay[day]
              if (!entries || entries.length === 0) return null
              return (
                <div key={day} className="flex items-start border-b border-navy-700 last:border-b-0">
                  <div className="w-14 py-3 px-3 text-xs font-bold text-gray-400 uppercase flex-shrink-0">
                    {day}
                  </div>
                  <div className="flex-1 py-2 px-2 space-y-1.5">
                    {entries.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Clock size={12} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-300">{entry.time}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getClassColor(entry.type)}`}>
                          {entry.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Open Mat Schedule */}
      {academy.schedule?.openMats && academy.schedule.openMats.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-green-400" />
            Open Mat
          </h2>
          <div className="bg-navy-800 rounded-2xl border border-green-500/20 p-4 space-y-2">
            {academy.schedule.openMats.map((slot, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-gray-300">{slot}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop-in pricing */}
      {academy.dropInPrice != null && (
        <div className="px-4 mt-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <DollarSign size={18} className="text-blue-400" />
            Drop-In
          </h2>
          <div className="bg-navy-800 rounded-2xl border border-navy-600 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Single drop-in</p>
              <p className="text-2xl font-bold text-white">${academy.dropInPrice}</p>
            </div>
            <div className="px-3 py-1 bg-blue-500/10 rounded-lg">
              <span className="text-xs text-blue-400 font-medium">Walk-ins welcome</span>
            </div>
          </div>
        </div>
      )}

      {/* Check In CTA */}
      <div className="px-4 mt-8">
        <button
          onClick={() => navigate('/record', { state: { academyId: academy.id, academyName: academy.name } })}
          className="w-full flex items-center justify-center gap-2 py-4 bg-accent hover:bg-accent/90 rounded-2xl text-base font-bold text-navy-900 transition-colors shadow-lg shadow-accent/20"
        >
          <CircleDot size={20} />
          Check In
        </button>
      </div>
    </div>
  )
}
