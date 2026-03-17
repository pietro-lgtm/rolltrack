import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Trophy,
  Medal,
  Target,
  Clock,
  Swords,
  Flame,
  ChevronRight,
  Plus,
  X,
  Award,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { api } from '../../api/client'
import BeltBadge from '../BeltBadge'
import type {
  AchievementsData,
  Competition,
  CompetitionResult,
  CompetitionDivision,
  BeltRank,
} from '../../types'

const iconMap: Record<string, React.ElementType> = {
  target: Target,
  clock: Clock,
  swords: Swords,
  flame: Flame,
  trophy: Trophy,
  medal: Medal,
}

const resultConfig: Record<CompetitionResult, { label: string; color: string; bg: string }> = {
  gold: { label: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
  silver: { label: 'Silver', color: 'text-gray-300', bg: 'bg-gray-400/15' },
  bronze: { label: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-600/15' },
  did_not_place: { label: 'DNP', color: 'text-gray-500', bg: 'bg-gray-600/15' },
}

const beltOrder: BeltRank[] = ['white', 'blue', 'purple', 'brown', 'black']

export default function Achievements() {
  const [data, setData] = useState<AchievementsData | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddComp, setShowAddComp] = useState(false)
  const [activeTab, setActiveTab] = useState<'milestones' | 'competitions' | 'belt'>('milestones')

  // Form state for adding competition
  const [compForm, setCompForm] = useState({
    tournamentName: '',
    date: '',
    result: 'gold' as CompetitionResult,
    weightClass: '',
    division: 'gi' as CompetitionDivision,
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [achievementsRes, compsRes] = await Promise.allSettled([
          api.get<AchievementsData>('/users/me/achievements'),
          api.get<{ data: Competition[] }>('/users/me/competitions'),
        ])

        if (achievementsRes.status === 'fulfilled') setData(achievementsRes.value)
        if (compsRes.status === 'fulfilled') setCompetitions(compsRes.value.data)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleAddCompetition(e: React.FormEvent) {
    e.preventDefault()
    if (!compForm.tournamentName || !compForm.date || !compForm.result) return

    setSubmitting(true)
    try {
      const created = await api.post<Competition>('/users/me/competitions', compForm)
      setCompetitions((prev) => [created, ...prev])
      setShowAddComp(false)
      setCompForm({
        tournamentName: '',
        date: '',
        result: 'gold',
        weightClass: '',
        division: 'gi',
        notes: '',
      })
      // Refresh achievements for updated comp record
      const refreshed = await api.get<AchievementsData>('/users/me/achievements')
      setData(refreshed)
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteCompetition(id: string) {
    try {
      await api.del(`/users/me/competitions/${id}`)
      setCompetitions((prev) => prev.filter((c) => c.id !== id))
      const refreshed = await api.get<AchievementsData>('/users/me/achievements')
      setData(refreshed)
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-accent" />
      </div>
    )
  }

  if (!data) return null

  const earnedMilestones = data.milestones.filter((m) => m.earned)
  const inProgressMilestones = data.milestones.filter((m) => !m.earned && m.progress > 0)

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400">Achievements</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Trophy size={12} />
          {earnedMilestones.length} earned
        </div>
      </div>

      {/* Competition Record Summary */}
      <div className="bg-navy-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Medal size={16} className="text-yellow-400" />
          <span className="text-sm font-semibold">Competition Record</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">
              {data.competitionRecord.wins}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">
              {data.competitionRecord.losses}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">
              {data.competitionRecord.podiums}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Podiums</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-navy-800 rounded-xl p-1 gap-1">
        {(['milestones', 'competitions', 'belt'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-accent text-navy-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'milestones' ? 'Milestones' : tab === 'competitions' ? 'Competitions' : 'Belt'}
          </button>
        ))}
      </div>

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="space-y-3">
          {/* Earned milestones */}
          {earnedMilestones.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase text-gray-500 tracking-wider mb-2">
                Earned
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {earnedMilestones.map((m) => {
                  const Icon = iconMap[m.icon] || Target
                  return (
                    <div
                      key={m.id}
                      className="bg-navy-800 rounded-xl p-3 border border-accent/20"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                          <Icon size={14} className="text-accent" />
                        </div>
                        <span className="text-xs font-semibold text-white truncate">
                          {m.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* In progress milestones */}
          {inProgressMilestones.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase text-gray-500 tracking-wider mb-2">
                In Progress
              </h4>
              <div className="space-y-2">
                {inProgressMilestones.slice(0, 6).map((m) => {
                  const Icon = iconMap[m.icon] || Target
                  const pct = Math.round(m.progress * 100)
                  return (
                    <div key={m.id} className="bg-navy-800 rounded-xl p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center shrink-0">
                          <Icon size={14} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-300 truncate">
                              {m.title}
                            </span>
                            <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full bg-navy-700 rounded-full h-1.5 mt-1.5">
                            <div
                              className="bg-accent rounded-full h-1.5 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {earnedMilestones.length === 0 && inProgressMilestones.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500">
              Start training to unlock achievements
            </div>
          )}
        </div>
      )}

      {/* Competitions Tab */}
      {activeTab === 'competitions' && (
        <div className="space-y-3">
          <button
            onClick={() => setShowAddComp(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl text-xs font-medium transition-colors"
          >
            <Plus size={14} />
            Add Competition Result
          </button>

          {/* Add competition form */}
          {showAddComp && (
            <form
              onSubmit={handleAddCompetition}
              className="bg-navy-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">Add Competition</span>
                <button
                  type="button"
                  onClick={() => setShowAddComp(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  required
                  value={compForm.tournamentName}
                  onChange={(e) =>
                    setCompForm((f) => ({ ...f, tournamentName: e.target.value }))
                  }
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent"
                  placeholder="e.g. IBJJF World Championship"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={compForm.date}
                    onChange={(e) => setCompForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1">
                    Weight Class
                  </label>
                  <input
                    type="text"
                    value={compForm.weightClass}
                    onChange={(e) =>
                      setCompForm((f) => ({ ...f, weightClass: e.target.value }))
                    }
                    className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent"
                    placeholder="e.g. Medio"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1">
                    Result *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      ['gold', 'silver', 'bronze', 'did_not_place'] as CompetitionResult[]
                    ).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCompForm((f) => ({ ...f, result: r }))}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                          compForm.result === r
                            ? `${resultConfig[r].bg} ${resultConfig[r].color} ring-1 ring-current`
                            : 'bg-navy-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        {resultConfig[r].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-gray-500 tracking-wider block mb-1">
                  Division
                </label>
                <div className="flex gap-1.5">
                  {(['gi', 'nogi'] as CompetitionDivision[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCompForm((f) => ({ ...f, division: d }))}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                        compForm.division === d
                          ? 'bg-accent text-navy-900'
                          : 'bg-navy-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {d === 'nogi' ? 'No-Gi' : 'Gi'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-accent hover:bg-accent/90 text-navy-900 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Result'
                )}
              </button>
            </form>
          )}

          {/* Competition list */}
          {competitions.length > 0 ? (
            <div className="space-y-2">
              {competitions.map((comp) => {
                const cfg = resultConfig[comp.result] || resultConfig.did_not_place
                return (
                  <div key={comp.id} className="bg-navy-800 rounded-xl p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {comp.tournamentName}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                          <span>{format(new Date(comp.date), 'MMM d, yyyy')}</span>
                          {comp.weightClass && (
                            <>
                              <span>-</span>
                              <span>{comp.weightClass}</span>
                            </>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-navy-700 text-[10px]">
                            {comp.division === 'nogi' ? 'No-Gi' : 'Gi'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCompetition(comp.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            !showAddComp && (
              <div className="text-center py-8 text-sm text-gray-500">
                <Trophy size={32} className="mx-auto text-gray-600 mb-2" />
                No competitions recorded yet
              </div>
            )
          )}
        </div>
      )}

      {/* Belt Progression Tab */}
      {activeTab === 'belt' && (
        <div className="bg-navy-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} className="text-accent" />
            <span className="text-sm font-semibold">Belt Progression</span>
          </div>

          {/* Belt timeline */}
          <div className="space-y-0">
            {beltOrder.map((belt, idx) => {
              const currentIdx = beltOrder.indexOf(data.beltProgression.currentBelt)
              const isCurrentOrPast = idx <= currentIdx
              const isCurrent = idx === currentIdx

              return (
                <div key={belt} className="flex items-center gap-3 relative">
                  {/* Timeline line */}
                  {idx < beltOrder.length - 1 && (
                    <div
                      className={`absolute left-[15px] top-8 w-0.5 h-6 ${
                        idx < currentIdx ? 'bg-accent' : 'bg-navy-600'
                      }`}
                    />
                  )}

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isCurrentOrPast
                        ? 'bg-accent/20 ring-2 ring-accent/40'
                        : 'bg-navy-700'
                    }`}
                  >
                    <BeltBadge rank={belt} size="sm" />
                  </div>
                  <div className="flex-1 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium capitalize ${
                          isCurrentOrPast ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {belt}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/15 text-accent">
                          Current
                          {data.beltProgression.stripes > 0 &&
                            ` - ${data.beltProgression.stripes} stripe${data.beltProgression.stripes > 1 ? 's' : ''}`}
                        </span>
                      )}
                    </div>
                    {isCurrent && data.beltProgression.startedAt && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Training since{' '}
                        {format(new Date(data.beltProgression.startedAt), 'MMM yyyy')}
                      </p>
                    )}
                  </div>
                  {isCurrentOrPast && !isCurrent && (
                    <TrendingUp size={12} className="text-accent/50" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-navy-700">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{data.totalSessions}</div>
              <div className="text-[10px] text-gray-500">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{data.totalHours}h</div>
              <div className="text-[10px] text-gray-500">Mat Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{data.longestStreak}d</div>
              <div className="text-[10px] text-gray-500">Best Streak</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
