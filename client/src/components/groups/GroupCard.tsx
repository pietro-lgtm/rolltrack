import { useNavigate } from 'react-router-dom'
import { Users, Shield, Swords, ChevronRight } from 'lucide-react'
import type { Group } from '../../types'

interface GroupCardProps {
  group: Group
}

const typeConfig = {
  academy: { icon: Shield, label: 'Academy', bg: 'bg-accent/20 text-accent', iconBg: 'bg-accent/20 text-accent' },
  friend: { icon: Users, label: 'Friends', bg: 'bg-purple-500/20 text-purple-400', iconBg: 'bg-purple-500/20 text-purple-400' },
  comp_team: { icon: Swords, label: 'Comp Team', bg: 'bg-red-500/20 text-red-400', iconBg: 'bg-red-500/20 text-red-400' },
}

export default function GroupCard({ group }: GroupCardProps) {
  const navigate = useNavigate()
  const type = group.type || (group.isAcademy ? 'academy' : 'friend')
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <button
      onClick={() => navigate(`/groups/${group.id}`)}
      className="w-full bg-navy-800 rounded-2xl overflow-hidden hover:bg-navy-700 transition-colors text-left"
    >
      {/* Mini banner */}
      {group.bannerImage ? (
        <div className="h-16 w-full overflow-hidden">
          <img src={group.bannerImage} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-16 w-full bg-gradient-to-r from-navy-700 to-navy-600" />
      )}

      <div className="p-4 flex items-center gap-4 -mt-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.iconBg} flex-shrink-0 border-2 border-navy-800`}>
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate text-white">{group.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${config.bg}`}>
              {config.label}
            </span>
          </div>
          {group.description && (
            <p className="text-sm text-gray-400 truncate mt-0.5">{group.description}</p>
          )}
          <span className="text-xs text-gray-500">{group.memberCount} members</span>
        </div>
        <ChevronRight size={18} className="text-gray-500 flex-shrink-0" />
      </div>
    </button>
  )
}
