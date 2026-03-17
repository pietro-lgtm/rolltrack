import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MapPin, Search, X, Star, User } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { BeltRank, Academy } from '../types'

const BELTS: BeltRank[] = ['white', 'blue', 'purple', 'brown', 'black']

const BELT_COLORS: Record<BeltRank, string> = {
  white: 'bg-white border-gray-300',
  blue: 'bg-blue-600 border-blue-500',
  purple: 'bg-purple-600 border-purple-500',
  brown: 'bg-amber-800 border-amber-700',
  black: 'bg-black border-gray-600',
}

const BELT_LABELS: Record<BeltRank, string> = {
  white: 'White',
  blue: 'Blue',
  purple: 'Purple',
  brown: 'Brown',
  black: 'Black',
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [belt, setBelt] = useState<BeltRank>('white')
  const [stripes, setStripes] = useState(0)
  const [academy, setAcademy] = useState<Academy | null>(null)
  const [bio, setBio] = useState('')
  const [weightClass, setWeightClass] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const totalSteps = 3

  const handleFinish = async () => {
    setSaving(true)
    try {
      await api.put('/users/me', {
        beltRank: belt,
        stripes,
        homeAcademyId: academy?.id || null,
        bio: bio.trim() || null,
        weightKg: weightClass ? parseFloat(weightClass) : null,
      })
      await refreshUser()
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Onboarding save error:', err)
      // Still navigate even if save fails
      navigate('/', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  const canNext = step < totalSteps - 1
  const canBack = step > 0

  return (
    <div className="min-h-dvh bg-gray-950 flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-blue-500' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Step {step + 1} of {totalSteps}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {step === 0 && (
          <BeltStep
            belt={belt}
            setBelt={setBelt}
            stripes={stripes}
            setStripes={setStripes}
          />
        )}
        {step === 1 && (
          <AcademyStep
            academy={academy}
            setAcademy={setAcademy}
          />
        )}
        {step === 2 && (
          <ProfileStep
            bio={bio}
            setBio={setBio}
            weightClass={weightClass}
            setWeightClass={setWeightClass}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 flex gap-3">
        {canBack && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center justify-center gap-1 px-6 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        )}
        <button
          onClick={canNext ? () => setStep(step + 1) : handleFinish}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold transition-colors"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : canNext ? (
            <>
              Next
              <ChevronRight size={18} />
            </>
          ) : (
            "Let's Go!"
          )}
        </button>
      </div>
    </div>
  )
}

// ── Step 1: Belt ─────────────────────────────────────────────

function BeltStep({
  belt, setBelt, stripes, setStripes,
}: {
  belt: BeltRank
  setBelt: (b: BeltRank) => void
  stripes: number
  setStripes: (s: number) => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">What belt are you?</h2>
      <p className="text-gray-500 text-sm mb-8">Select your current belt rank and stripes</p>

      {/* Belt selector */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {BELTS.map((b) => (
          <button
            key={b}
            onClick={() => setBelt(b)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              belt === b
                ? 'border-blue-500 bg-gray-900'
                : 'border-transparent bg-gray-900/50 hover:bg-gray-900'
            }`}
          >
            <div
              className={`w-10 h-5 rounded-sm border ${BELT_COLORS[b]} ${
                belt === b ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950' : ''
              }`}
            />
            <span className={`text-xs font-medium ${belt === b ? 'text-white' : 'text-gray-500'}`}>
              {BELT_LABELS[b]}
            </span>
          </button>
        ))}
      </div>

      {/* Stripes */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-3">Stripes</label>
        <div className="flex gap-3">
          {[0, 1, 2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => setStripes(s)}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                stripes === s
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 mt-4 justify-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-6 rounded-sm transition-colors ${
                i < stripes ? 'bg-white' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Academy ──────────────────────────────────────────

function AcademyStep({
  academy, setAcademy,
}: {
  academy: Academy | null
  setAcademy: (a: Academy | null) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Academy[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (q.length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const res = await api.get<{ data: Academy[] }>(`/academies?q=${encodeURIComponent(q)}`)
      setResults(res.data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">What's your home academy?</h2>
      <p className="text-gray-500 text-sm mb-6">Where do you train most often? You can skip this.</p>

      {academy ? (
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <MapPin size={18} className="text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium truncate">{academy.name}</div>
            {academy.address && (
              <div className="text-xs text-gray-500 truncate">{academy.address}</div>
            )}
          </div>
          <button
            onClick={() => setAcademy(null)}
            className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <X size={14} className="text-gray-400" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <Search size={16} className="text-gray-600 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for your academy..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
            {loading && (
              <div className="w-4 h-4 border-2 border-gray-700 border-t-blue-400 rounded-full animate-spin" />
            )}
          </div>

          {/* Results */}
          {query.length >= 2 && (
            <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
              {results.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setAcademy(a)
                    setQuery('')
                    setResults([])
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-900 transition-colors text-left"
                >
                  <MapPin size={16} className="text-gray-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{a.name}</div>
                    {a.address && (
                      <div className="text-xs text-gray-500 truncate">{a.address}</div>
                    )}
                  </div>
                </button>
              ))}
              {searched && !loading && results.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  No academies found
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Step 3: Profile ──────────────────────────────────────────

function ProfileStep({
  bio, setBio, weightClass, setWeightClass,
}: {
  bio: string
  setBio: (b: string) => void
  weightClass: string
  setWeightClass: (w: string) => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
      <p className="text-gray-500 text-sm mb-6">Optional info to personalize your profile</p>

      {/* Avatar placeholder */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
          <User size={32} className="text-gray-600" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about your BJJ journey..."
            rows={3}
            maxLength={280}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none text-sm"
          />
          <div className="text-right text-xs text-gray-600 mt-1">{bio.length}/280</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Weight (kg)</label>
          <input
            type="number"
            value={weightClass}
            onChange={(e) => setWeightClass(e.target.value)}
            placeholder="e.g. 77"
            step="0.1"
            min="30"
            max="200"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
          />
        </div>
      </div>
    </div>
  )
}
