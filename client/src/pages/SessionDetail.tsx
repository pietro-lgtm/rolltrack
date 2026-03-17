import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Clock,
  Swords,
  GraduationCap,
  Heart,
  Flame,
  Share2,
  Cloud,
  ThermometerSun,
  MessageSquare,
  Zap,
} from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ShareCard from '../components/profile/ShareCard'
import type { TrainingSession, Roll } from '../types'

const feelingLabels: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '\u{1F629}', label: 'Terrible', color: 'text-red-400' },
  2: { emoji: '\u{1F615}', label: 'Rough', color: 'text-orange-400' },
  3: { emoji: '\u{1F610}', label: 'Okay', color: 'text-yellow-400' },
  4: { emoji: '\u{1F60A}', label: 'Good', color: 'text-green-400' },
  5: { emoji: '\u{1F525}', label: 'Amazing', color: 'text-accent' },
}

const resultLabels: Record<string, { label: string; color: string }> = {
  sub_win: { label: 'Sub Win', color: 'text-green-400 bg-green-400/10' },
  sub_loss: { label: 'Sub Loss', color: 'text-red-400 bg-red-400/10' },
  points_win: { label: 'Points Win', color: 'text-blue-400 bg-blue-400/10' },
  points_loss: { label: 'Points Loss', color: 'text-orange-400 bg-orange-400/10' },
  draw: { label: 'Draw', color: 'text-gray-400 bg-gray-400/10' },
  positional: { label: 'Positional', color: 'text-yellow-400 bg-yellow-400/10' },
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [rolls, setRolls] = useState<Roll[]>([])
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function fetchSession() {
      setLoading(true)
      try {
        const data = await api.get<TrainingSession & { rolls?: Roll[] }>(`/sessions/${id}`)
        if (cancelled) return
        setSession(data)
        setRolls(data.rolls || [])
      } catch {
        // handled by empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSession()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="px-4 pt-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 mb-4">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="text-center py-12">
          <p className="text-gray-500">Session not found</p>
        </div>
      </div>
    )
  }

  const typeLabel = session.type === 'open_mat' ? 'Open Mat' : session.type === 'drilling' ? 'Drilling' : session.type === 'competition' ? 'Competition' : session.type === 'private' ? 'Private' : 'Class'
  const giLabel = session.gi === 'nogi' ? 'No-Gi' : session.gi === 'gi' ? 'Gi' : session.gi === 'both' ? 'Gi & No-Gi' : ''

  // Duration breakdown percentages
  const classTimePct = session.classTime ? (session.classTime / session.duration) * 100 : 0
  const sparringTimePct = session.sparringTime ? (session.sparringTime / session.duration) * 100 : 0
  const drillingTimePct = Math.max(0, 100 - classTimePct - sparringTimePct)

  // HR data for simple bar visualization
  const hrData = session.wearableData?.heartRate || session.heartRate

  return (
    <div className="min-h-dvh bg-navy-900">
      {/* Header */}
      <div className="bg-navy-800 px-4 pt-4 pb-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="p-2 -mr-2 rounded-lg text-gray-400 hover:text-accent transition-colors"
          >
            <Share2 size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
            {typeLabel}
          </span>
          {giLabel && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
              {giLabel}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold mb-1">
          {session.academyName || typeLabel}
        </h1>
        <p className="text-sm text-gray-400">
          {format(new Date(session.createdAt), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Duration Breakdown */}
        <div className="bg-navy-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock size={16} className="text-accent" />
            Duration Breakdown
          </h3>
          <div className="text-2xl font-bold mb-3">{formatDuration(session.duration)}</div>

          {/* Colored progress bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-navy-700">
            {classTimePct > 0 && (
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${classTimePct}%` }}
              />
            )}
            {sparringTimePct > 0 && (
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${sparringTimePct}%` }}
              />
            )}
            {drillingTimePct > 0 && classTimePct + sparringTimePct > 0 && (
              <div
                className="h-full bg-yellow-500 transition-all"
                style={{ width: `${drillingTimePct}%` }}
              />
            )}
          </div>

          <div className="flex gap-4 mt-3 text-xs">
            {session.classTime && session.classTime > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                <span className="text-gray-400">Class {formatDuration(session.classTime)}</span>
              </div>
            )}
            {session.sparringTime && session.sparringTime > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                <span className="text-gray-400">Sparring {formatDuration(session.sparringTime)}</span>
              </div>
            )}
            {drillingTimePct > 0 && classTimePct + sparringTimePct > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />
                <span className="text-gray-400">Drilling</span>
              </div>
            )}
          </div>
        </div>

        {/* Rolls Section */}
        {rolls.length > 0 && (
          <div className="bg-navy-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Swords size={16} className="text-red-400" />
              Rolls ({rolls.length})
            </h3>
            <div className="space-y-2">
              {rolls.map((roll) => {
                const result = roll.result ? resultLabels[roll.result] : null
                return (
                  <div
                    key={roll.id}
                    className="flex items-center gap-3 bg-navy-700 rounded-xl p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {roll.partnerName || 'Unknown'}
                        </span>
                        {result && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${result.color}`}>
                            {result.label}
                          </span>
                        )}
                      </div>
                      {roll.submissionType && (
                        <span className="text-[11px] text-gray-500">{roll.submissionType}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {formatDuration(roll.durationMins * 60)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Techniques Section */}
        {session.techniques && session.techniques.length > 0 && (
          <div className="bg-navy-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <GraduationCap size={16} className="text-purple-400" />
              Techniques
            </h3>
            <div className="flex flex-wrap gap-2">
              {session.techniques.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-navy-700 rounded-lg text-xs text-gray-300 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Wearable / Heart Rate Section */}
        {hrData && (
          <div className="bg-navy-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Heart size={16} className="text-pink-400" />
              Heart Rate
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{hrData.min}</div>
                <div className="text-[10px] text-gray-500 uppercase">Min</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">{hrData.avg}</div>
                <div className="text-[10px] text-gray-500 uppercase">Avg</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{hrData.max}</div>
                <div className="text-[10px] text-gray-500 uppercase">Max</div>
              </div>
            </div>

            {/* Simple HR bar chart */}
            <div className="flex items-end gap-0.5 h-16">
              {Array.from({ length: 20 }).map((_, i) => {
                const range = hrData.max - hrData.min
                const simulated = hrData.min + Math.sin(i * 0.8) * range * 0.3 + range * 0.4 + Math.random() * range * 0.15
                const pct = range > 0 ? ((simulated - hrData.min) / range) * 100 : 50
                const clampedPct = Math.max(10, Math.min(100, pct))
                const color = clampedPct > 80 ? 'bg-red-500' : clampedPct > 50 ? 'bg-yellow-500' : 'bg-green-500'
                return (
                  <div
                    key={i}
                    className={`flex-1 ${color} rounded-t-sm opacity-80`}
                    style={{ height: `${clampedPct}%` }}
                  />
                )
              })}
            </div>

            {session.wearableData?.calories && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy-700">
                <Zap size={14} className="text-orange-400" />
                <span className="text-sm text-gray-300">
                  {session.wearableData.calories} calories burned
                </span>
              </div>
            )}
          </div>
        )}

        {/* Feeling & Intensity */}
        {session.feeling && (
          <div className="bg-navy-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Flame size={16} className="text-orange-400" />
              Feeling & Intensity
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{feelingLabels[session.feeling]?.emoji}</span>
                <span className={`text-sm font-medium ${feelingLabels[session.feeling]?.color}`}>
                  {feelingLabels[session.feeling]?.label}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-6 h-2 rounded-full ${
                      level <= (session.feeling ?? 0)
                        ? 'bg-accent'
                        : 'bg-navy-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {session.notes && (
          <div className="bg-navy-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-400" />
              Notes
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {session.notes}
            </p>
          </div>
        )}
      </div>

      {/* Share Card Modal */}
      {showShare && user && (
        <ShareCard
          session={session}
          user={user}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
