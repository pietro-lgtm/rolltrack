import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Clock, Swords, Filter } from 'lucide-react'
import type { TrainingSession, GiType, SessionType } from '../../types'

interface WorkoutLogProps {
  sessions: TrainingSession[]
}

const typeConfig: Record<string, { label: string; color: string; dot: string }> = {
  class: { label: 'Class', color: 'text-blue-400', dot: 'bg-blue-500' },
  open_mat: { label: 'Open Mat', color: 'text-green-400', dot: 'bg-green-500' },
  drilling: { label: 'Drilling', color: 'text-orange-400', dot: 'bg-orange-500' },
  competition: { label: 'Competition', color: 'text-red-400', dot: 'bg-red-500' },
  private: { label: 'Private', color: 'text-yellow-400', dot: 'bg-yellow-500' },
}

const feelingEmojis: Record<number, string> = {
  1: '\u{1F629}',
  2: '\u{1F615}',
  3: '\u{1F610}',
  4: '\u{1F60A}',
  5: '\u{1F525}',
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function sessionTitle(session: TrainingSession): string {
  const time = new Date(session.createdAt)
  const hour = time.getHours()
  let period = 'Morning'
  if (hour >= 12 && hour < 17) period = 'Afternoon'
  else if (hour >= 17) period = 'Evening'

  const giLabel = session.gi === 'nogi' ? 'No-Gi' : session.gi === 'gi' ? 'Gi' : ''
  const typeLabel = typeConfig[session.type]?.label || session.type

  return `${period} ${giLabel} ${typeLabel}`.replace(/\s+/g, ' ').trim()
}

export default function WorkoutLog({ sessions }: WorkoutLogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState<SessionType | 'all'>('all')
  const [filterGi, setFilterGi] = useState<GiType | 'all'>('all')

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (filterType !== 'all' && s.type !== filterType) return false
      if (filterGi !== 'all' && s.gi !== filterGi) return false
      return true
    })
  }, [sessions, filterType, filterGi])

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{filtered.length} sessions</span>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showFilters ? 'bg-accent/20 text-accent' : 'bg-navy-700 text-gray-400'
          }`}
        >
          <Filter size={12} />
          Filters
        </button>
      </div>

      {/* Filter options */}
      {showFilters && (
        <div className="bg-navy-800 rounded-xl p-3 mb-3 space-y-3">
          <div>
            <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1.5">
              Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'class', 'open_mat', 'drilling', 'competition', 'private'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    filterType === t
                      ? 'bg-accent text-navy-900'
                      : 'bg-navy-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'All' : typeConfig[t]?.label || t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1.5">
              Gi / No-Gi
            </label>
            <div className="flex gap-1.5">
              {(['all', 'gi', 'nogi', 'both'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGi(g)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    filterGi === g
                      ? 'bg-accent text-navy-900'
                      : 'bg-navy-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {g === 'all' ? 'All' : g === 'nogi' ? 'No-Gi' : g === 'both' ? 'Both' : 'Gi'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-2">
        {filtered.map((session) => {
          const expanded = expandedId === session.id
          const cfg = typeConfig[session.type] || typeConfig.class

          return (
            <div
              key={session.id}
              className="bg-navy-800 rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedId(expanded ? null : session.id)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <div className={`w-1.5 self-stretch rounded-full ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {sessionTitle(session)}
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">
                      {format(new Date(session.createdAt), 'MMM d')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {session.academyName && (
                      <span className="text-[11px] text-gray-500 truncate">
                        {session.academyName}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock size={11} />
                      <span className="text-[11px] font-mono">
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                    {session.rollsCount && session.rollsCount > 0 && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Swords size={11} />
                        <span className="text-[11px]">{session.rollsCount} rolls</span>
                      </div>
                    )}
                    {session.feeling && (
                      <span className="text-sm">{feelingEmojis[session.feeling]}</span>
                    )}
                  </div>
                </div>
                {expanded ? (
                  <ChevronUp size={16} className="text-gray-500 shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-gray-500 shrink-0" />
                )}
              </button>

              {/* Expanded detail */}
              {expanded && (
                <div className="px-4 pb-3 pt-1 border-t border-navy-700 space-y-2">
                  {session.notes && (
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {session.notes}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {session.classTime && session.classTime > 0 && (
                      <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded-full">
                        Class: {formatDuration(session.classTime)}
                      </span>
                    )}
                    {session.sparringTime && session.sparringTime > 0 && (
                      <span className="px-2 py-0.5 bg-red-500/15 text-red-400 rounded-full">
                        Sparring: {formatDuration(session.sparringTime)}
                      </span>
                    )}
                    {session.gi && (
                      <span className="px-2 py-0.5 bg-purple-500/15 text-purple-400 rounded-full">
                        {session.gi === 'nogi' ? 'No-Gi' : session.gi === 'gi' ? 'Gi' : 'Both'}
                      </span>
                    )}
                  </div>
                  {session.techniques && session.techniques.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {session.techniques.map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-navy-700 rounded text-[10px] text-gray-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {session.heartRate && (
                    <div className="flex gap-4 text-[11px] text-gray-400">
                      <span>Avg HR: {session.heartRate.avg}</span>
                      <span>Max HR: {session.heartRate.max}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500">
          No sessions match your filters
        </div>
      )}
    </div>
  )
}
