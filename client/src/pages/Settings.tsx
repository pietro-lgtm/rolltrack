import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  LogOut,
  Watch,
  Shield,
  Info,
  ChevronRight,
  User,
  Building2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import type { User as UserType, BeltRank } from '../types'

const beltOptions: BeltRank[] = ['white', 'blue', 'purple', 'brown', 'black']

interface WearableStatus {
  connected: boolean
  lastSync?: string
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [beltRank, setBeltRank] = useState<BeltRank>(user?.beltRank ?? 'white')
  const [stripes, setStripes] = useState(user?.stripes ?? 0)
  const [weight, setWeight] = useState(user?.weight?.toString() ?? '')
  const [dob, setDob] = useState('')
  const [academy, setAcademy] = useState(user?.academy ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Privacy settings
  const [profilePublic, setProfilePublic] = useState(true)
  const [showActivity, setShowActivity] = useState(true)
  const [shareStats, setShareStats] = useState(true)

  // Wearable connections
  const [wearableStatus, setWearableStatus] = useState<Record<string, WearableStatus>>({
    whoop: { connected: false },
    oura: { connected: false },
    apple_health: { connected: false },
  })

  useEffect(() => {
    if (user) {
      setName(user.name)
      setBio(user.bio ?? '')
      setBeltRank(user.beltRank)
      setStripes(user.stripes ?? 0)
      setWeight(user.weight?.toString() ?? '')
      setAcademy(user.academy ?? '')
    }
  }, [user])

  // Fetch wearable connection status
  useEffect(() => {
    api.get<Record<string, WearableStatus>>('/wearable-auth/status')
      .then(setWearableStatus)
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put<UserType>('/users/me', {
        name,
        bio,
        beltRank,
        stripes,
        weight: weight ? parseFloat(weight) : undefined,
        academy,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // handle error
    } finally {
      setSaving(false)
    }
  }

  const connectWearable = async (provider: string) => {
    if (provider === 'apple_health') return // No web API
    try {
      const res = await api.get<{ url: string }>(`/wearable-auth/connect/${provider}`)
      window.location.href = res.url
    } catch (err: any) {
      alert(err?.body || 'Integration not configured yet')
    }
  }

  const disconnectWearable = async (provider: string) => {
    try {
      await api.post(`/wearable-auth/disconnect/${provider}`)
      setWearableStatus((prev) => ({ ...prev, [provider]: { connected: false } }))
    } catch {}
  }

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-dvh bg-navy-900">
      {/* Header */}
      <div className="bg-navy-800 px-4 pt-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-green-500/20 text-green-400'
              : 'bg-accent hover:bg-accent/90 text-navy-900'
          } disabled:opacity-50`}
        >
          <Save size={14} />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Profile Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Profile
            </h2>
          </div>
          <div className="bg-navy-800 rounded-2xl p-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-navy-700 border border-navy-600 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-navy-700 border border-navy-600 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-none"
                placeholder="Tell us about your BJJ journey..."
              />
            </div>

            {/* Belt */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Belt Rank</label>
              <div className="flex gap-2">
                {beltOptions.map((belt) => {
                  const colors: Record<BeltRank, string> = {
                    white: 'bg-white text-black',
                    blue: 'bg-blue-600 text-white',
                    purple: 'bg-purple-600 text-white',
                    brown: 'bg-amber-800 text-white',
                    black: 'bg-gray-900 text-white border border-gray-600',
                  }
                  return (
                    <button
                      key={belt}
                      onClick={() => setBeltRank(belt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                        colors[belt]
                      } ${
                        beltRank === belt
                          ? 'ring-2 ring-accent ring-offset-2 ring-offset-navy-800 scale-105'
                          : 'opacity-50 hover:opacity-75'
                      }`}
                    >
                      {belt}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stripes */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Stripes</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStripes(s)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                      stripes === s
                        ? 'bg-accent text-navy-900'
                        : 'bg-navy-700 text-gray-400 hover:bg-navy-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75"
                className="w-full px-3 py-2.5 bg-navy-700 border border-navy-600 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2.5 bg-navy-700 border border-navy-600 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              />
            </div>
          </div>
        </section>

        {/* Home Academy */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-green-400" />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Home Academy
            </h2>
          </div>
          <div className="bg-navy-800 rounded-2xl p-4">
            <input
              type="text"
              value={academy}
              onChange={(e) => setAcademy(e.target.value)}
              placeholder="Search academies..."
              className="w-full px-3 py-2.5 bg-navy-700 border border-navy-600 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
            />
          </div>
        </section>

        {/* Wearable Connections */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Watch size={16} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Wearables
            </h2>
          </div>
          <div className="bg-navy-800 rounded-2xl overflow-hidden divide-y divide-navy-700">
            {[
              { key: 'whoop', name: 'Whoop', icon: '\u{1F4AA}' },
              { key: 'oura', name: 'Oura Ring', icon: '\u{1F48D}' },
              { key: 'apple_health', name: 'Apple Health', icon: '\u{2764}\u{FE0F}' },
            ].map(({ key, name: wName, icon }) => {
              const status = wearableStatus[key]
              const isConnected = status?.connected ?? false
              const isApple = key === 'apple_health'
              return (
                <div key={key} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <div>
                      <span className="text-sm font-medium">{wName}</span>
                      {isApple && <span className="text-xs text-gray-600 block">Manual entry only</span>}
                    </div>
                  </div>
                  {isApple ? (
                    <span className="text-xs text-gray-600">N/A</span>
                  ) : isConnected ? (
                    <button
                      onClick={() => disconnectWearable(key)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      Connected
                    </button>
                  ) : (
                    <button
                      onClick={() => connectWearable(key)}
                      className="px-3 py-1.5 rounded-lg bg-navy-600 text-gray-300 text-xs font-medium hover:bg-navy-500 transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Privacy Settings */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-yellow-400" />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Privacy
            </h2>
          </div>
          <div className="bg-navy-800 rounded-2xl overflow-hidden divide-y divide-navy-700">
            {[
              { label: 'Public Profile', value: profilePublic, setter: setProfilePublic },
              { label: 'Show Activity', value: showActivity, setter: setShowActivity },
              { label: 'Share Stats', value: shareStats, setter: setShareStats },
            ].map(({ label, value, setter }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm font-medium">{label}</span>
                <button
                  onClick={() => setter(!value)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    value ? 'bg-accent' : 'bg-navy-600'
                  }`}
                >
                  <div
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: value ? 'translateX(22px)' : 'translateX(0)',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              About
            </h2>
          </div>
          <div className="bg-navy-800 rounded-2xl overflow-hidden divide-y divide-navy-700">
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Terms of Service', value: '' },
              { label: 'Privacy Policy', value: '' },
              { label: 'Contact Support', value: '' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm text-gray-300">{label}</span>
                {value ? (
                  <span className="text-xs text-gray-500">{value}</span>
                ) : (
                  <ChevronRight size={16} className="text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  )
}
