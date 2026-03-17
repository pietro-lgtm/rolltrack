import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Edit3, ChevronRight, Users, ClipboardList } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import Avatar from '../components/Avatar'
import BeltBadge from '../components/BeltBadge'
import StatsGrid from '../components/profile/StatsGrid'
import StreakBanner from '../components/home/StreakBanner'
import TrainingCalendar from '../components/profile/TrainingCalendar'
import WorkoutLog from '../components/profile/WorkoutLog'
import ProgressCharts from '../components/profile/ProgressCharts'
import Achievements from '../components/profile/Achievements'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import type { TrainingSession, UserStats, Technique } from '../types'

export default function Profile() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      try {
        const [statsRes, sessionsRes] = await Promise.allSettled([
          api.get<UserStats>('/sessions/stats'),
          api.get<{ data: TrainingSession[] }>('/sessions'),
        ])

        if (cancelled) return

        if (statsRes.status === 'fulfilled') setStats(statsRes.value)
        if (sessionsRes.status === 'fulfilled') setSessions(sessionsRes.value.data)
      } catch {
        // Fallback handled below
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [])

  // Derive stats from sessions if API didn't provide them
  // API returns snake_case converted to camelCase by api client
  const derivedStats = useMemo(() => {
    const s = stats as any
    if (s) {
      return {
        totalSessions: s.totalSessions ?? 0,
        totalHours: (s.totalTimeSecs ?? 0) / 3600,
        sparringHours: (s.totalSparringSecs ?? 0) / 3600,
        submissions: s.rolls?.totalRolls ?? 0,
      }
    }
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0)
    const totalSparring = sessions.reduce((sum, s) => sum + (s.sparringTime ?? 0), 0)
    return {
      totalSessions: sessions.length,
      totalHours: totalDuration / 3600,
      sparringHours: totalSparring / 3600,
      submissions: sessions.reduce((sum, s) => sum + (s.rollsCount ?? 0), 0),
    }
  }, [stats, sessions])

  const calendarSessions = useMemo(
    () =>
      sessions.map((s) => ({
        date: s.createdAt,
        duration_secs: s.duration ?? 0,
      })),
    [sessions]
  )

  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [sessions])

  // Streak data
  const streakData = useMemo(() => {
    const s = stats as any
    if (s) {
      return {
        streakCount: s.streak ?? 0,
        weekSessions: s.sessionsThisWeek ?? 0,
      }
    }
    return { streakCount: 0, weekSessions: 0 }
  }, [stats])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">You</h1>
        <Link
          to="/settings"
          className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <Settings size={18} />
        </Link>
      </div>

      {/* User card */}
      <div className="bg-navy-800 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              name={user?.name || 'User'}
              beltRank={user?.beltRank}
              size="lg"
            />
            <Link
              to="/settings"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-navy-600 border-2 border-navy-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Edit3 size={12} />
            </Link>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {user?.beltRank && <BeltBadge rank={user.beltRank} size="md" />}
              {user?.stripes !== undefined && user.stripes > 0 && (
                <span className="text-xs text-gray-500">
                  {'|'.repeat(user.stripes)} {user.stripes} stripe{user.stripes > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {user?.academy && (
              <p className="text-sm text-gray-400 mt-1 truncate">{user.academy}</p>
            )}
            {user?.bio && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-navy-700">
          <Link
            to="/profile/friends"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-navy-700 hover:bg-navy-600 rounded-xl text-xs font-medium text-gray-300 transition-colors"
          >
            <Users size={14} />
            Friends
          </Link>
          <Link
            to="/profile/log"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-navy-700 hover:bg-navy-600 rounded-xl text-xs font-medium text-gray-300 transition-colors"
          >
            <ClipboardList size={14} />
            Training Log
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={derivedStats} />

      {/* Streak Banner */}
      <StreakBanner
        streakCount={streakData.streakCount}
        weekSessions={streakData.weekSessions}
      />

      {/* Training Calendar */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Training Calendar</h3>
        <TrainingCalendar sessions={calendarSessions} />
      </div>

      {/* Progress Charts */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Progress</h3>
        <ProgressCharts sessions={sessions} techniques={techniques} />
      </div>

      {/* Achievements */}
      <Achievements />

      {/* Recent Training */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-400">Recent Training</h3>
          <Link
            to="/profile/log"
            className="flex items-center gap-0.5 text-xs text-accent hover:text-accent/80 transition-colors"
          >
            See All
            <ChevronRight size={14} />
          </Link>
        </div>
        <WorkoutLog sessions={recentSessions} />
      </div>
    </div>
  )
}
