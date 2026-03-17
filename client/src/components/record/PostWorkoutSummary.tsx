import {
  Clock,
  Swords,
  BookOpen,
  Target,
  Trophy,
  Heart,
  Flame,
  Cloud,
  Share2,
  Save,
} from 'lucide-react'
import type {
  SessionType,
  GiType,
  Roll,
  Technique,
  WeatherInfo,
  WearableInfo,
  Academy,
} from '../../types'

interface PostWorkoutSummaryProps {
  sessionType: SessionType
  giType: GiType
  academy: Academy | null
  totalSecs: number
  classSecs: number
  sparringSecs: number
  drillingSecs: number
  rolls: Roll[]
  techniques: Technique[]
  notes: string
  feeling: number
  intensity: number
  weather: WeatherInfo | null
  wearable: WearableInfo | null
  onShare: () => void
  onSave: () => void
  saving: boolean
}

const FEELING_EMOJIS = ['', '\uD83D\uDE29', '\uD83D\uDE15', '\uD83D\uDE10', '\uD83D\uDE0A', '\uD83E\uDD29']
const INTENSITY_LABELS = ['', 'Light', 'Moderate', 'Hard', 'Intense', 'Max']

const SESSION_LABELS: Record<SessionType, string> = {
  class: 'Class',
  open_mat: 'Open Mat',
  drilling: 'Drilling',
  competition: 'Competition',
  private: 'Private',
}

const GI_LABELS: Record<GiType, string> = {
  gi: 'Gi',
  nogi: 'No-Gi',
  both: 'Gi & No-Gi',
}

function formatDuration(secs: number): string {
  if (secs === 0) return '0m'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function PostWorkoutSummary({
  sessionType,
  giType,
  academy,
  totalSecs,
  classSecs,
  sparringSecs,
  drillingSecs,
  rolls,
  techniques,
  notes,
  feeling,
  intensity,
  weather,
  wearable,
  onShare,
  onSave,
  saving,
}: PostWorkoutSummaryProps) {
  const wins = rolls.filter(
    (r) => r.result === 'sub_win' || r.result === 'points_win'
  ).length
  const losses = rolls.filter(
    (r) => r.result === 'sub_loss' || r.result === 'points_loss'
  ).length
  const draws = rolls.filter(
    (r) => r.result === 'draw' || r.result === 'positional'
  ).length

  return (
    <div className="bg-gradient-to-br from-navy-800 via-navy-800 to-blue-900/20 rounded-2xl overflow-hidden">
      {/* Header accent bar */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="p-4 space-y-4">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Session Complete</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span>{SESSION_LABELS[sessionType]}</span>
              <span className="text-gray-600">&middot;</span>
              <span>{GI_LABELS[giType]}</span>
              {academy && (
                <>
                  <span className="text-gray-600">&middot;</span>
                  <span className="truncate max-w-[120px]">{academy.name}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatDuration(totalSecs)}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
              Total Time
            </div>
          </div>
        </div>

        {/* Phase breakdown */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-navy-700/50 rounded-lg p-2.5 text-center">
            <BookOpen size={14} className="text-blue-400 mx-auto mb-1" />
            <div className="text-sm font-semibold text-white">
              {formatDuration(classSecs)}
            </div>
            <div className="text-[10px] text-gray-500">Class</div>
          </div>
          <div className="bg-navy-700/50 rounded-lg p-2.5 text-center">
            <Swords size={14} className="text-red-400 mx-auto mb-1" />
            <div className="text-sm font-semibold text-white">
              {formatDuration(sparringSecs)}
            </div>
            <div className="text-[10px] text-gray-500">Sparring</div>
          </div>
          <div className="bg-navy-700/50 rounded-lg p-2.5 text-center">
            <Target size={14} className="text-amber-400 mx-auto mb-1" />
            <div className="text-sm font-semibold text-white">
              {formatDuration(drillingSecs)}
            </div>
            <div className="text-[10px] text-gray-500">Drilling</div>
          </div>
        </div>

        {/* Rolls summary */}
        {rolls.length > 0 && (
          <div className="bg-navy-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-xs font-semibold text-gray-300">
                {rolls.length} Roll{rolls.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="text-green-400 font-semibold">
                {wins}W
              </span>
              <span className="text-red-400 font-semibold">{losses}L</span>
              <span className="text-gray-400 font-semibold">{draws}D</span>
            </div>
            {rolls.some((r) => r.submissionType) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rolls
                  .filter((r) => r.submissionType)
                  .map((r) => (
                    <span
                      key={r.id}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        r.result === 'sub_win'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {r.submissionType}
                    </span>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Techniques */}
        {techniques.length > 0 && (
          <div className="bg-navy-700/50 rounded-lg p-3">
            <span className="text-xs font-semibold text-gray-300 block mb-2">
              Techniques Practiced
            </span>
            <div className="flex flex-wrap gap-1.5">
              {techniques.map((tech) => (
                <span
                  key={tech.id}
                  className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-medium"
                >
                  {tech.name} ({tech.successes}/{tech.attempts})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Feeling & Intensity */}
        <div className="flex gap-3">
          <div className="flex-1 bg-navy-700/50 rounded-lg p-2.5 text-center">
            <div className="text-xl mb-0.5">{FEELING_EMOJIS[feeling] || '-'}</div>
            <div className="text-[10px] text-gray-500">Feeling</div>
          </div>
          <div className="flex-1 bg-navy-700/50 rounded-lg p-2.5 text-center">
            <div className="text-sm font-semibold text-white mb-0.5">
              {INTENSITY_LABELS[intensity] || '-'}
            </div>
            <div className="text-[10px] text-gray-500">Intensity</div>
          </div>
        </div>

        {/* Weather */}
        {weather && (
          <div className="flex items-center gap-3 bg-navy-700/50 rounded-lg p-2.5">
            <Cloud size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">
              {weather.temperature}&deg;F &middot;{' '}
              <span className="capitalize">{weather.condition}</span> &middot;{' '}
              {weather.humidity}% humidity
            </span>
          </div>
        )}

        {/* HR data */}
        {wearable && (
          <div className="flex items-center gap-4 bg-navy-700/50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5">
              <Heart size={14} className="text-pink-400" />
              <span className="text-xs text-gray-300">
                {wearable.avgHR} avg / {wearable.maxHR} max
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-orange-400" />
              <span className="text-xs text-gray-300">
                {wearable.calories} cal
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="bg-navy-700/50 rounded-lg p-3">
            <span className="text-xs font-semibold text-gray-400 block mb-1">
              Notes
            </span>
            <p className="text-sm text-gray-300 leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-navy-700 text-gray-300 text-sm font-medium hover:bg-navy-600 transition-colors active:scale-[0.98]"
          >
            <Share2 size={16} />
            Share
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 transition-colors active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </div>
    </div>
  )
}
