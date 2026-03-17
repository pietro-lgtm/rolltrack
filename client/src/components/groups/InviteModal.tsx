import { useState } from 'react'
import { X, Copy, Check, Link2, Share2 } from 'lucide-react'

interface InviteModalProps {
  inviteCode: string
  isOpen: boolean
  onClose: () => void
}

export default function InviteModal({ inviteCode, isOpen, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false)
  const inviteLink = `${window.location.origin}/invite/${inviteCode}`

  if (!isOpen) return null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  async function handleShareLink() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join my group on RollTrack',
          text: `Use this invite code to join: ${inviteCode}`,
          url: inviteLink,
        })
      } else {
        await navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // cancelled
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-navy-800 rounded-2xl border border-navy-600 shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-navy-700">
          <h3 className="font-bold text-lg text-white">Invite Members</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Invite code */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-2 block">Invite Code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-navy-700 rounded-xl px-4 py-3 font-mono text-lg text-white tracking-widest text-center border border-navy-600">
                {inviteCode}
              </div>
              <button
                onClick={handleCopy}
                className="p-3 bg-navy-700 hover:bg-navy-600 rounded-xl border border-navy-600 transition-colors"
              >
                {copied ? (
                  <Check size={20} className="text-green-400" />
                ) : (
                  <Copy size={20} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Share link */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-2 block">Share Link</label>
            <div className="flex items-center gap-2 bg-navy-700 rounded-xl px-3 py-2.5 border border-navy-600">
              <Link2 size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-400 truncate flex-1">{inviteLink}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-navy-700 hover:bg-navy-600 rounded-xl text-sm font-medium text-white transition-colors"
            >
              <Copy size={16} />
              Copy Code
            </button>
            <button
              onClick={handleShareLink}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 rounded-xl text-sm font-semibold text-navy-900 transition-colors"
            >
              <Share2 size={16} />
              Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
