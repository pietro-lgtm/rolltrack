import { useNavigate } from 'react-router-dom'
import { MapPin, DollarSign, Calendar, X, ChevronRight, CircleDot } from 'lucide-react'
import type { Academy } from '../../types'

interface AcademyCardProps {
  academy: Academy
  onClose: () => void
}

export default function AcademyCard({ academy, onClose }: AcademyCardProps) {
  const navigate = useNavigate()

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1000] animate-slide-up">
      <div className="bg-navy-800/95 backdrop-blur-md rounded-2xl border border-navy-600 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-white truncate">{academy.name}</h3>
              {academy.affiliation && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-semibold rounded-full">
                  {academy.affiliation}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-2">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{academy.address}</span>
          </div>
        </div>

        {/* Info pills */}
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {academy.openMatDays && academy.openMatDays.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-lg">
              <Calendar size={12} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                Open Mat: {academy.openMatDays.join(', ')}
              </span>
            </div>
          )}
          {academy.schedule?.openMats && academy.schedule.openMats.length > 0 && !academy.openMatDays && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-lg">
              <Calendar size={12} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                Open Mat: {academy.schedule.openMats.join(', ')}
              </span>
            </div>
          )}
          {academy.dropInPrice != null && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 rounded-lg">
              <DollarSign size={12} className="text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">
                Drop-in: ${academy.dropInPrice}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex gap-3">
          <button
            onClick={() => navigate(`/map/academy/${academy.id}`)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-navy-700 hover:bg-navy-600 rounded-xl text-sm font-medium text-white transition-colors"
          >
            View Details
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => navigate('/record', { state: { academyId: academy.id, academyName: academy.name } })}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent/90 rounded-xl text-sm font-semibold text-navy-900 transition-colors"
          >
            <CircleDot size={16} />
            Check In
          </button>
        </div>
      </div>
    </div>
  )
}
