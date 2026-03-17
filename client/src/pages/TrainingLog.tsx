import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Filter,
  Clock,
  Swords,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'
import { api } from '../api/client'
import type { TrainingSession, SessionType, GiType } from '../types'

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  class: { label: 'Class', color: 'text-blue-400', bg: 'bg-blue-500/15' },
  open_mat: { label: 'Open Mat', color: 'text-green-400', bg: 'bg-green-500/15' },
  drilling: { label: 'Drilling', color: 'text-orange-400', bg: 'bg-orange-500/15' },
  competition: { label: 'Competition', color: 'text-red-400', bg: 'bg-red-500/15' },
  private: { label: 'Private', color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
  home_drill: { label: 'Home Drill', color: 'text-purple-400', bg: 'bg-purple-500/15' },
  open_gym: { label: 'Open Gym', color: 'text-teal-400', bg: 'bg-teal-500/15' },
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

export default function TrainingLog() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState<SessionType | 'all'>('all')
  const [filterGi, setFilterGi] = useState<GiType | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const LIMIT = 20

  const fetchSessions = useCallback(
    async (newOffset: number, append = false) => {
      if (append) setLoadingMore(true)
      else setLoading(true)

      try {
        const params = new URLSearchParams()
        params.set('limit', String(LIMIT))
        params.set('offset', String(newOffset))
        if (filterType !== 'all') params.set('type', filterType)
        if (filterGi !== 'all') params.set('gi_nogi', filterGi)
        if (dateFrom) params.set('from', dateFrom)
        if (dateTo) params.set('to', dateTo)

        const res = await api.get<{ data: TrainingSession[]; total: number }>(
          `/sessions?${params.toString()}`
        )
        if (append) {
          setSessions((prev) => [...prev, ...res.data])
        } else {
          setSessions(res.data)
        }
        setTotal(res.total)
        setOffset(newOffset)
      } catch {
        // silent
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [filterType, filterGi, dateFrom, dateTo]
  )

  useEffect(() => {
    fetchSessions(0)
  }, [fetchSessions])

  const hasMore = offset + LIMIT < total

  const groupedByMonth = useMemo(() => {
    const groups: { month: string; sessions: TrainingSession[] }[] = []
    let currentMonth = ''
    for (const s of sessions) {
      const month = format(new Date(s.createdAt), 'MMMM yyyy')
      if (month !== currentMonth) {
        currentMonth = month
        groups.push({ month, sessions: [] })
      }
      groups[groups.length - 1].sessions.push(s)
    }
    return groups
  }, [sessions])

  return (
    <div className="px-4 pt-6 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold">Training Log</h1>
        <div className="ml-auto">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showFilters || filterType !== 'all' || filterGi !== 'all' || dateFrom || dateTo
                ? 'bg-accent/20 text-accent'
                : 'bg-navy-700 text-gray-400'
            }`}
          >
            <Filter size={12} />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-navy-800 rounded-xl p-4 space-y-4">
          {/* Session type */}
          <div>
            <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1.5">
              Session Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'class', 'open_mat', 'drilling', 'competition', 'private'] as const).map(
                (t) => (
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
                )
              )}
            </div>
          </div>

          {/* Gi/No-Gi */}
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

          {/* Date range */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1.5">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1.5">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Clear filters */}
          {(filterType !== 'all' || filterGi !== 'all' || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setFilterType('all')
                setFilterGi('all')
                setDateFrom('')
                setDateTo('')
              }}
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Summary bar */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{total} sessions total</span>
        {(filterType !== 'all' || filterGi !== 'all' || dateFrom || dateTo) && (
          <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full">Filtered</span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      )}

      {/* Sessions grouped by month */}
      {!loading && (
        <div className="space-y-6">
          {groupedByMonth.map((group) => (
            <div key={group.month}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.month}
              </h3>
              <div className="space-y-2">
                {group.sessions.map((session) => {
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
                        <div className="flex flex-col items-center min-w-[36px]">
                          <span className="text-lg font-bold text-white leading-none">
                            {format(new Date(session.createdAt), 'd')}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase">
                            {format(new Date(session.createdAt), 'EEE')}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {sessionTitle(session)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.color}`}
                            >
                              {cfg.label}
                            </span>
                            {session.gi && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/15 text-purple-400">
                                {session.gi === 'nogi' ? 'No-Gi' : session.gi === 'gi' ? 'Gi' : 'Both'}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-gray-400">
                              <Clock size={10} />
                              <span className="text-[10px] font-mono">
                                {formatDuration(session.duration)}
                              </span>
                            </div>
                            {session.rollsCount != null && session.rollsCount > 0 && (
                              <div className="flex items-center gap-1 text-gray-400">
                                <Swords size={10} />
                                <span className="text-[10px]">{session.rollsCount}</span>
                              </div>
                            )}
                          </div>
                          {session.academyName && (
                            <div className="flex items-center gap-1 mt-0.5 text-gray-500">
                              <MapPin size={10} />
                              <span className="text-[10px] truncate">{session.academyName}</span>
                            </div>
                          )}
                        </div>

                        {expanded ? (
                          <ChevronUp size={16} className="text-gray-500 shrink-0" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500 shrink-0" />
                        )}
                      </button>

                      {expanded && (
                        <div className="px-4 pb-3 pt-1 border-t border-navy-700 space-y-2">
                          {session.notes && (
                            <p className="text-xs text-gray-300 leading-relaxed">{session.notes}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {session.classTime != null && session.classTime > 0 && (
                              <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded-full">
                                Class: {formatDuration(session.classTime)}
                              </span>
                            )}
                            {session.sparringTime != null && session.sparringTime > 0 && (
                              <span className="px-2 py-0.5 bg-red-500/15 text-red-400 rounded-full">
                                Sparring: {formatDuration(session.sparringTime)}
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/session/${session.id}`}
                            className="block text-xs text-accent hover:text-accent/80 mt-1 transition-colors"
                          >
                            View full session details
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={() => fetchSessions(offset + LIMIT, true)}
              disabled={loadingMore}
              className="w-full py-3 bg-navy-800 hover:bg-navy-700 rounded-xl text-sm text-gray-300 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          )}

          {sessions.length === 0 && !loading && (
            <div className="text-center py-16">
              <Calendar size={40} className="mx-auto text-gray-600 mb-3" />
              <p className="text-sm text-gray-500">No sessions found</p>
              <p className="text-xs text-gray-600 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
