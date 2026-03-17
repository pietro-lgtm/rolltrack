import { useState } from 'react'
import { Watch, Heart, Flame, Pencil } from 'lucide-react'
import type { WearableInfo } from '../../types'

interface WearableSyncProps {
  data: WearableInfo | null
  onChange: (data: WearableInfo) => void
}

export default function WearableSync({ data, onChange }: WearableSyncProps) {
  const [syncing, setSyncing] = useState(false)
  const [manual, setManual] = useState(false)
  const [avgHR, setAvgHR] = useState(data?.avgHR ?? 0)
  const [maxHR, setMaxHR] = useState(data?.maxHR ?? 0)
  const [calories, setCalories] = useState(data?.calories ?? 0)

  const handleSync = () => {
    setSyncing(true)
    // Mock sync with delay
    setTimeout(() => {
      const mockData: WearableInfo = {
        avgHR: 142,
        maxHR: 178,
        calories: 620,
      }
      setAvgHR(mockData.avgHR)
      setMaxHR(mockData.maxHR)
      setCalories(mockData.calories)
      onChange(mockData)
      setSyncing(false)
    }, 1500)
  }

  const handleManualSave = () => {
    onChange({ avgHR, maxHR, calories })
    setManual(false)
  }

  if (data && !manual) {
    return (
      <div className="bg-navy-800 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Heart Rate Data
          </span>
          <button
            onClick={() => setManual(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-400 hover:bg-navy-700 transition-colors"
          >
            <Pencil size={14} />
          </button>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-pink-400" />
            <div>
              <div className="text-sm font-semibold text-white">
                {data.avgHR} <span className="text-xs text-gray-500">avg</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-red-500" />
            <div>
              <div className="text-sm font-semibold text-white">
                {data.maxHR} <span className="text-xs text-gray-500">max</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-400" />
            <div>
              <div className="text-sm font-semibold text-white">
                {data.calories} <span className="text-xs text-gray-500">cal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (manual) {
    return (
      <div className="bg-navy-800 rounded-xl p-3 space-y-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Manual HR Entry
        </span>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Avg HR
            </label>
            <input
              type="number"
              value={avgHR || ''}
              onChange={(e) => setAvgHR(parseInt(e.target.value, 10) || 0)}
              className="w-full mt-1 bg-navy-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Max HR
            </label>
            <input
              type="number"
              value={maxHR || ''}
              onChange={(e) => setMaxHR(parseInt(e.target.value, 10) || 0)}
              className="w-full mt-1 bg-navy-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Calories
            </label>
            <input
              type="number"
              value={calories || ''}
              onChange={(e) => setCalories(parseInt(e.target.value, 10) || 0)}
              className="w-full mt-1 bg-navy-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setManual(false)}
            className="flex-1 py-2 rounded-lg bg-navy-700 text-gray-400 text-xs font-medium hover:bg-navy-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleManualSave}
            className="flex-1 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-navy-800 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Watch size={18} className="text-gray-500" />
          <span className="text-sm text-gray-400">Wearable Data</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setManual(true)}
            className="px-3 py-1.5 rounded-lg bg-navy-700 text-xs text-gray-400 font-medium hover:bg-navy-600 transition-colors"
          >
            Manual
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-xs text-blue-400 font-semibold hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                Syncing...
              </span>
            ) : (
              'Sync Wearable'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
