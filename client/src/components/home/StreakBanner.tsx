interface StreakBannerProps {
  streakCount: number
  weekSessions: number
  weekDays?: boolean[]
}

function getMotivation(streak: number): string {
  if (streak === 0) return 'Start your streak today!'
  if (streak === 1) return 'Great start! Keep it going.'
  if (streak < 5) return 'Building momentum!'
  if (streak < 10) return 'You\'re on fire!'
  if (streak < 20) return 'Unstoppable! Keep grinding.'
  if (streak < 50) return 'Machine mode activated.'
  return 'Legendary consistency!'
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function StreakBanner({
  streakCount,
  weekSessions,
  weekDays = [false, false, false, false, false, false, false],
}: StreakBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-navy-800 to-blue-900/40 p-4">
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative flex items-start justify-between">
        {/* Left side: streak info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" role="img" aria-label="fire">
              {streakCount > 0 ? '\uD83D\uDD25' : '\uD83D\uDCAA'}
            </span>
            <span className="text-xl font-bold text-white">
              {streakCount > 0 ? `${streakCount} Day Streak!` : 'No Streak Yet'}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            {getMotivation(streakCount)}
          </p>
          <p className="text-xs text-gray-500">
            {weekSessions} session{weekSessions !== 1 ? 's' : ''} this week
          </p>
        </div>
      </div>

      {/* Week progress dots */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
        {weekDays.map((trained, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                trained
                  ? 'bg-green-400 shadow-sm shadow-green-400/50'
                  : 'bg-gray-700'
              }`}
            />
            <span className="text-[9px] text-gray-600 font-medium">
              {WEEK_LABELS[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
