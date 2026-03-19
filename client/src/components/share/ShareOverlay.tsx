import { useState, useRef } from 'react'
import { X, Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'

interface ShareOverlayProps {
  isOpen: boolean
  onClose: () => void
  data: {
    totalSecs: number
    rollsCount: number
    wins: number
    losses: number
    draws: number
    beltRank?: string
    date: string
    sessionType: string
    gi: string
  }
}

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const BELT_COLORS: Record<string, string> = {
  white: '#e5e7eb',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  brown: '#92400e',
  black: '#1f2937',
}

export default function ShareOverlay({ isOpen, onClose, data }: ShareOverlayProps) {
  const [sessionName, setSessionName] = useState('')
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const beltColor = BELT_COLORS[data.beltRank || 'white'] || BELT_COLORS.white

  const captureCard = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    })
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  }

  const handleDownload = async () => {
    setExporting(true)
    try {
      const blob = await captureCard()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rolltrack-${data.date}.png`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const handleShare = async () => {
    setExporting(true)
    try {
      const blob = await captureCard()
      if (!blob) return
      const file = new File([blob], `rolltrack-${data.date}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: sessionName || 'RollTrack Session',
        })
      } else {
        // Fallback to download
        await handleDownload()
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Share Session</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Session name input */}
        <div className="px-4 pt-4">
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Name this session (optional)"
            className="w-full bg-gray-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        {/* Share Card Preview */}
        <div className="p-4">
          <div
            ref={cardRef}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
              padding: '24px',
            }}
          >
            {/* Brand */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="text-white font-black text-sm">R</span>
              </div>
              <span className="text-gray-400 text-sm font-semibold tracking-wide">ROLLTRACK</span>
            </div>

            {/* Session Name */}
            {sessionName && (
              <h2 className="text-white text-xl font-bold mb-3">{sessionName}</h2>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-bold text-white">{formatDuration(data.totalSecs)}</div>
                <div className="text-xs text-gray-400 mt-0.5">Time on Mat</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-bold text-white">{data.rollsCount}</div>
                <div className="text-xs text-gray-400 mt-0.5">Rolls</div>
              </div>
            </div>

            {/* W/L/D if any rolls */}
            {data.rollsCount > 0 && (
              <div className="flex gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold">
                  {data.wins}W
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold">
                  {data.losses}L
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-500/20 text-gray-400 text-xs font-semibold">
                  {data.draws}D
                </span>
              </div>
            )}

            {/* Belt & Type badges */}
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-12 rounded-full"
                style={{ backgroundColor: beltColor }}
              />
              <span className="text-xs text-gray-500 capitalize">{data.sessionType}</span>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-xs text-gray-500 uppercase">{data.gi}</span>
              <span className="text-xs text-gray-600 ml-auto">{data.date}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 p-4 pt-0">
          <button
            onClick={handleDownload}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={handleShare}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-400 transition-colors disabled:opacity-50"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
