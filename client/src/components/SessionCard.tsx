import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TrainingSession } from '../types'
import Avatar from './Avatar'
import BeltBadge from './BeltBadge'
import { Clock, Swords, Heart, MessageCircle, ThumbsUp, Share2 } from 'lucide-react'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

const typeLabels: Record<string, { label: string; color: string }> = {
  class: { label: 'Class', color: 'bg-blue-500/20 text-blue-400' },
  open_mat: { label: 'Open Mat', color: 'bg-green-500/20 text-green-400' },
  drilling: { label: 'Drilling', color: 'bg-orange-500/20 text-orange-400' },
  competition: { label: 'Competition', color: 'bg-red-500/20 text-red-400' },
  private: { label: 'Private', color: 'bg-purple-500/20 text-purple-400' },
}

const giLabels: Record<string, { label: string; color: string }> = {
  gi: { label: 'Gi', color: 'bg-indigo-500/20 text-indigo-400' },
  no_gi: { label: 'No-Gi', color: 'bg-teal-500/20 text-teal-400' },
  nogi: { label: 'No-Gi', color: 'bg-teal-500/20 text-teal-400' },
  both: { label: 'Gi & No-Gi', color: 'bg-cyan-500/20 text-cyan-400' },
}

const feelingEmojis: Record<number, string> = {
  1: '\u{1F629}',
  2: '\u{1F615}',
  3: '\u{1F610}',
  4: '\u{1F60A}',
  5: '\u{1F525}',
}

interface SessionCardProps {
  session: TrainingSession
  onLike?: (sessionId: string) => void
  onComment?: (sessionId: string) => void
  onShare?: (sessionId: string) => void
}

export default function SessionCard({ session, onLike, onComment, onShare }: SessionCardProps) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(session.liked ?? false)
  const [likeCount, setLikeCount] = useState(session.likes ?? 0)

  const {
    user,
    type,
    gi,
    duration,
    sparringTime,
    rollsCount,
    feeling,
    notes,
    academyName,
    heartRate,
    createdAt,
    comments,
  } = session

  const typeInfo = typeLabels[type] ?? typeLabels.class
  const giInfo = gi ? giLabels[gi] : null

  const handleLike = () => {
    setLiked((prev) => !prev)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
    onLike?.(session.id)
  }

  const handleCardClick = () => {
    navigate(`/session/${session.id}`)
  }

  return (
    <div
      className="bg-gray-800 rounded-2xl p-4 space-y-3 cursor-pointer transition-colors hover:bg-gray-750"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick() }}
    >
      {/* Header: avatar, name, belt, academy, time */}
      <div className="flex items-center gap-3">
        {user && (
          <Avatar name={user.name} src={user.avatar} beltRank={user.beltRank} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate text-white">{user?.name ?? 'Unknown'}</span>
            {user && <BeltBadge rank={user.beltRank} stripes={user.stripes} />}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {(academyName || user?.academy) && (
              <>
                <span className="truncate">{academyName ?? user?.academy}</span>
                <span>·</span>
              </>
            )}
            <span className="whitespace-nowrap">{formatTimeAgo(createdAt)}</span>
          </div>
        </div>
        {feeling && (
          <span className="text-xl" title={`Feeling: ${feeling}/5`}>
            {feelingEmojis[feeling]}
          </span>
        )}
      </div>

      {/* Badges row: type + gi/nogi */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        {giInfo && (
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${giInfo.color}`}>
            {giInfo.label}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-300">
          <Clock size={14} className="text-blue-400" />
          <span>{formatDuration(duration)}</span>
        </div>
        {sparringTime != null && sparringTime > 0 && (
          <div className="flex items-center gap-1.5 text-gray-300">
            <Swords size={14} className="text-red-400" />
            <span>{formatDuration(sparringTime)} sparring</span>
          </div>
        )}
        {rollsCount != null && rollsCount > 0 && (
          <div className="flex items-center gap-1.5 text-gray-300">
            <Swords size={14} className="text-amber-400" />
            <span>{rollsCount} rolls</span>
          </div>
        )}
        {heartRate && (
          <div className="flex items-center gap-1.5 text-gray-300">
            <Heart size={14} className="text-pink-400" />
            <span>{heartRate.avg} avg bpm</span>
          </div>
        )}
      </div>

      {/* Notes preview */}
      {notes && (
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{notes}</p>
      )}

      {/* Photo */}
      {session.photo && (
        <div className="rounded-xl overflow-hidden">
          <img src={session.photo} alt="Session" className="w-full h-48 object-cover" />
        </div>
      )}

      {/* Actions: like, comment, share */}
      <div className="flex items-center gap-6 pt-2 border-t border-gray-700" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'
          }`}
        >
          <ThumbsUp size={16} className={liked ? 'fill-current' : ''} />
          <span>{likeCount}</span>
        </button>
        <button
          onClick={() => onComment?.(session.id)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors text-sm"
        >
          <MessageCircle size={16} />
          <span>{comments ?? 0}</span>
        </button>
        <button
          onClick={() => onShare?.(session.id)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors text-sm ml-auto"
        >
          <Share2 size={16} />
        </button>
      </div>
    </div>
  )
}
