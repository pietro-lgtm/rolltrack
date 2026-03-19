import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { api } from '../api/client'
import type { UserStats } from '../types'
import WeeklySchedule from '../components/home/WeeklySchedule'
import StreakBanner from '../components/home/StreakBanner'
import ActivityFeed from '../components/home/ActivityFeed'

export default function Home() {
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    api
      .get<UserStats>('/sessions/stats')
      .then(setStats)
      .catch(() => {
        setStats({
          totalSessions: 0,
          totalDuration: 0,
          totalRolls: 0,
          sessionsThisWeek: 0,
          currentStreak: 0,
          longestStreak: 0,
          avgSessionDuration: 0,
          favoriteTechniques: [],
          beltProgress: 0,
          monthlyBreakdown: [],
          weekDays: [false, false, false, false, false, false, false],
        })
      })
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            RollTrack
          </h1>
        </div>
        <button className="relative w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center hover:bg-navy-700 transition-colors">
          <Bell size={20} className="text-gray-400" />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-24 space-y-5">
        {/* Weekly Schedule */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            This Week
          </h2>
          <WeeklySchedule />
        </section>

        {/* Streak Banner */}
        {stats && (
          <section>
            <StreakBanner
              streakCount={stats.currentStreak}
              weekSessions={stats.sessionsThisWeek}
              weekDays={stats.weekDays}
            />
          </section>
        )}

        {/* Activity Feed */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Activity Feed
          </h2>
          <ActivityFeed />
        </section>
      </div>
    </div>
  )
}
