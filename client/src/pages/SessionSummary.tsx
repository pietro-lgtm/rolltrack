import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Clock, Swords, GraduationCap, Star, Eye, PartyPopper } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ShareCard from '../components/profile/ShareCard'
import type { TrainingSession, Roll } from '../types'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function SessionSummary() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [rolls, setRolls] = useState<Roll[]>([])
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

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
        // handled
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSession()
    return () => { cancelled = true }
  }, [id])

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="px-4 pt-12 text-center">
        <p className="text-gray-500">Session not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-navy-700 rounded-xl text-sm"
        >
          Go Home
        </button>
      </div>
    )
  }

  const wins = rolls.filter((r) => r.result === 'sub_win' || r.result === 'points_win').length
  const losses = rolls.filter((r) => r.result === 'sub_loss' || r.result === 'points_loss').length

  return (
    <div className="min-h-dvh bg-navy-900 relative overflow-hidden">
      {/* CSS Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {Array.from({ length: 40 }).map((_, i) => {
            const colors = ['bg-accent', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-pink-400', 'bg-yellow-400']
            const color = colors[i % colors.length]
            const left = Math.random() * 100
            const delay = Math.random() * 1.5
            const duration = 2 + Math.random() * 1.5
            const size = 4 + Math.random() * 6
            const rotation = Math.random() * 360

            return (
              <div
                key={i}
                className={`absolute ${color} rounded-sm opacity-90`}
                style={{
                  left: `${left}%`,
                  top: -10,
                  width: size,
                  height: size * 1.5,
                  transform: `rotate(${rotation}deg)`,
                  animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
                }}
              />
            )
          })}
          <style>{`
            @keyframes confetti-fall {
              0% {
                opacity: 1;
                transform: translateY(0) rotate(0deg) scale(1);
              }
              100% {
                opacity: 0;
                transform: translateY(100vh) rotate(720deg) scale(0.5);
              }
            }
          `}</style>
        </div>
      )}

      <div className="relative z-0 px-4 pt-10 pb-8 space-y-6">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mx-auto">
            <PartyPopper size={32} className="text-accent" />
          </div>
          <h1 className="text-3xl font-black">Great Session!</h1>
          <p className="text-sm text-gray-400">
            {format(new Date(session.createdAt), 'EEEE, MMMM d')} at{' '}
            {session.academyName || 'the gym'}
          </p>
        </div>

        {/* Total Time Breakdown */}
        <div className="bg-navy-800 rounded-2xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock size={18} className="text-accent" />
            <span className="text-sm text-gray-400">Total Time</span>
          </div>
          <div className="text-4xl font-black mb-4">
            {formatDuration(session.duration)}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {session.classTime && session.classTime > 0 && (
              <div className="bg-blue-500/10 rounded-xl py-2 px-1">
                <div className="text-sm font-bold text-blue-400">
                  {formatDuration(session.classTime)}
                </div>
                <div className="text-[10px] text-gray-500 uppercase">Class</div>
              </div>
            )}
            {session.sparringTime && session.sparringTime > 0 && (
              <div className="bg-red-500/10 rounded-xl py-2 px-1">
                <div className="text-sm font-bold text-red-400">
                  {formatDuration(session.sparringTime)}
                </div>
                <div className="text-[10px] text-gray-500 uppercase">Sparring</div>
              </div>
            )}
            {session.rollsCount !== undefined && session.rollsCount > 0 && (
              <div className="bg-purple-500/10 rounded-xl py-2 px-1">
                <div className="text-sm font-bold text-purple-400">
                  {session.rollsCount}
                </div>
                <div className="text-[10px] text-gray-500 uppercase">Rolls</div>
              </div>
            )}
          </div>
        </div>

        {/* Rolls Summary */}
        {rolls.length > 0 && (
          <div className="bg-navy-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Swords size={16} className="text-red-400" />
              Rolls Summary
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{wins}</div>
                <div className="text-[10px] text-gray-500 uppercase">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{losses}</div>
                <div className="text-[10px] text-gray-500 uppercase">Losses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">
                  {rolls.length - wins - losses}
                </div>
                <div className="text-[10px] text-gray-500 uppercase">Draw</div>
              </div>
            </div>
          </div>
        )}

        {/* Techniques Summary */}
        {session.techniques && session.techniques.length > 0 && (
          <div className="bg-navy-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <GraduationCap size={16} className="text-purple-400" />
              Techniques Practiced
            </h3>
            <div className="flex flex-wrap gap-2">
              {session.techniques.map((tech, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 rounded-lg text-xs text-purple-300 font-medium"
                >
                  <Star size={10} />
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setShowShare(true)}
            className="w-full py-3.5 bg-accent hover:bg-accent/90 text-navy-900 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Star size={16} />
            Share Session
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to={`/session/${session.id}`}
              className="py-3 bg-navy-700 hover:bg-navy-600 rounded-2xl text-sm font-medium text-center transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={14} />
              View Details
            </Link>
            <button
              onClick={() => navigate('/')}
              className="py-3 bg-navy-700 hover:bg-navy-600 rounded-2xl text-sm font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
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
