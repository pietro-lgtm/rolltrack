import { useRef, useState } from 'react'
import { Download, Share2, X, Clock, Swords, MapPin } from 'lucide-react'
import type { TrainingSession, User, BeltRank } from '../../types'

interface ShareCardProps {
  session: TrainingSession
  user: User
  onClose?: () => void
}

const beltGradients: Record<BeltRank, string> = {
  white: 'from-gray-200 to-gray-400',
  blue: 'from-blue-600 to-blue-800',
  purple: 'from-purple-600 to-purple-800',
  brown: 'from-amber-700 to-amber-900',
  black: 'from-gray-800 to-gray-950',
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function ShareCard({ session, user, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleDownload = () => {
    // In production, use html2canvas to capture the card div.
    // For now, show an alert about the intent.
    alert('To enable download, install html2canvas and call html2canvas(cardRef.current)')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RollTrack Session',
          text: `Just trained for ${formatDuration(session.duration)} at ${session.academyName || 'the gym'}!`,
          url: window.location.href,
        })
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const gradient = beltGradients[user.beltRank] || beltGradients.blue

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-navy-800/80 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      )}

      {/* The shareable card */}
      <div
        ref={cardRef}
        className={`w-full max-w-sm bg-gradient-to-br ${gradient} rounded-3xl overflow-hidden shadow-2xl`}
      >
        {/* Top pattern overlay */}
        <div className="relative p-6 pb-4">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-4 w-20 h-20 bg-white/5 rounded-full translate-y-1/2" />

          {/* Logo */}
          <div className="relative flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">RT</span>
            </div>
            <span className="text-white/80 text-sm font-semibold tracking-wide">
              RollTrack
            </span>
          </div>

          {/* User info */}
          <div className="relative mb-6">
            <h2 className="text-white text-2xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-white/90 text-xs font-medium capitalize">
                {user.beltRank} Belt
                {user.stripes && user.stripes > 0
                  ? ` ${'|'.repeat(user.stripes)}`
                  : ''}
              </span>
              {user.academy && (
                <span className="text-white/60 text-xs">{user.academy}</span>
              )}
            </div>
          </div>

          {/* Session stats */}
          <div className="relative grid grid-cols-3 gap-3">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <Clock size={16} className="mx-auto mb-1 text-white/60" />
              <div className="text-white text-lg font-bold">
                {formatDuration(session.duration)}
              </div>
              <div className="text-white/50 text-[10px] uppercase">Duration</div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <Swords size={16} className="mx-auto mb-1 text-white/60" />
              <div className="text-white text-lg font-bold">
                {session.rollsCount ?? 0}
              </div>
              <div className="text-white/50 text-[10px] uppercase">Rolls</div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <MapPin size={16} className="mx-auto mb-1 text-white/60" />
              <div className="text-white text-sm font-bold truncate">
                {session.academyName || 'Gym'}
              </div>
              <div className="text-white/50 text-[10px] uppercase">Academy</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-black/20 flex items-center justify-between">
          <span className="text-white/40 text-[10px]">rolltrack.app</span>
          <span className="text-white/40 text-[10px]">
            {new Date(session.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy-700 hover:bg-navy-600 rounded-xl text-sm font-medium transition-colors"
        >
          <Download size={16} />
          Download
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-navy-900 rounded-xl text-sm font-medium transition-colors"
        >
          <Share2 size={16} />
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
    </div>
  )
}
