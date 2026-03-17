import { useMemo } from 'react'
import { format, subWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import type { TrainingSession, Technique } from '../../types'

interface ProgressChartsProps {
  sessions: TrainingSession[]
  techniques: Technique[]
}

function formatHours(secs: number): string {
  return (secs / 3600).toFixed(1)
}

export default function ProgressCharts({ sessions, techniques }: ProgressChartsProps) {
  // Weekly volume for last 8 weeks
  const weeklyData = useMemo(() => {
    const weeks: {
      label: string
      giSecs: number
      nogiSecs: number
      totalSecs: number
    }[] = []

    const now = new Date()

    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i))
      const weekEnd = endOfWeek(subWeeks(now, i))
      let giSecs = 0
      let nogiSecs = 0

      for (const s of sessions) {
        const d = new Date(s.createdAt)
        if (isWithinInterval(d, { start: weekStart, end: weekEnd })) {
          if (s.gi === 'nogi') {
            nogiSecs += s.duration
          } else {
            giSecs += s.duration
          }
        }
      }

      weeks.push({
        label: format(weekStart, 'M/d'),
        giSecs,
        nogiSecs,
        totalSecs: giSecs + nogiSecs,
      })
    }

    return weeks
  }, [sessions])

  const maxWeekSecs = useMemo(
    () => Math.max(...weeklyData.map((w) => w.totalSecs), 3600),
    [weeklyData]
  )

  // Top techniques (from technique list or session data)
  const topTechniques = useMemo(() => {
    // If techniques provided with successRate, use those
    if (techniques.length > 0) {
      return techniques
        .slice()
        .sort((a, b) => (b.successRate ?? 0) - (a.successRate ?? 0))
        .slice(0, 6)
        .map((t) => ({
          name: t.name,
          count: Math.round((t.successRate ?? 0) * 100),
          category: t.category,
        }))
    }

    // Otherwise count from sessions
    const counts: Record<string, number> = {}
    for (const s of sessions) {
      if (s.techniques) {
        for (const t of s.techniques) {
          counts[t] = (counts[t] || 0) + 1
        }
      }
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, count]) => ({ name, count, category: 'other' as const }))
  }, [sessions, techniques])

  const maxTechCount = useMemo(
    () => Math.max(...topTechniques.map((t) => t.count), 1),
    [topTechniques]
  )

  const categoryColors: Record<string, string> = {
    sweep: 'bg-blue-500',
    submission: 'bg-red-500',
    pass: 'bg-green-500',
    escape: 'bg-yellow-500',
    takedown: 'bg-purple-500',
    guard: 'bg-cyan-500',
    other: 'bg-gray-500',
  }

  return (
    <div className="space-y-6">
      {/* Weekly Training Volume */}
      <div className="bg-navy-800 rounded-2xl p-4">
        <h3 className="text-sm font-semibold mb-1">Weekly Volume</h3>
        <p className="text-[11px] text-gray-500 mb-4">Last 8 weeks (hours)</p>

        <div className="flex items-end gap-1.5" style={{ height: 120 }}>
          {weeklyData.map((week, i) => {
            const giPct = maxWeekSecs > 0 ? (week.giSecs / maxWeekSecs) * 100 : 0
            const nogiPct = maxWeekSecs > 0 ? (week.nogiSecs / maxWeekSecs) * 100 : 0
            const totalH = formatHours(week.totalSecs)

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
              >
                {/* Total label on top */}
                <span className="text-[9px] text-gray-500 font-mono">
                  {week.totalSecs > 0 ? `${totalH}` : ''}
                </span>

                {/* Bar container */}
                <div className="w-full flex flex-col justify-end" style={{ height: 80 }}>
                  {/* Gi portion */}
                  <div
                    className="w-full bg-blue-500 rounded-t-sm transition-all duration-500"
                    style={{ height: `${giPct}%`, minHeight: giPct > 0 ? 2 : 0 }}
                  />
                  {/* No-gi portion */}
                  <div
                    className="w-full bg-purple-500 rounded-b-sm transition-all duration-500"
                    style={{ height: `${nogiPct}%`, minHeight: nogiPct > 0 ? 2 : 0 }}
                  />
                  {/* Empty fill */}
                  {week.totalSecs === 0 && (
                    <div className="w-full bg-navy-700 rounded-sm" style={{ height: 4 }} />
                  )}
                </div>

                {/* Week label */}
                <span className="text-[9px] text-gray-500">{week.label}</span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-navy-700">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span className="text-[10px] text-gray-400">Gi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
            <span className="text-[10px] text-gray-400">No-Gi</span>
          </div>
        </div>
      </div>

      {/* Top Techniques */}
      {topTechniques.length > 0 && (
        <div className="bg-navy-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-1">Top Techniques</h3>
          <p className="text-[11px] text-gray-500 mb-4">Most practiced</p>

          <div className="space-y-3">
            {topTechniques.map((tech, i) => {
              const pct = (tech.count / maxTechCount) * 100
              const barColor = categoryColors[tech.category] || categoryColors.other

              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">{tech.name}</span>
                    <span className="text-[11px] text-gray-500 font-mono tabular-nums">
                      {tech.count}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
