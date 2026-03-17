import { Users, Shield, Swords } from 'lucide-react'
import type { Group } from '../../types'

interface GroupBannerProps {
  group: Group
}

const typeConfig = {
  academy: { icon: Shield, label: 'Academy', bg: 'bg-accent/20 text-accent' },
  friend: { icon: Users, label: 'Friends', bg: 'bg-purple-500/20 text-purple-400' },
  comp_team: { icon: Swords, label: 'Comp Team', bg: 'bg-red-500/20 text-red-400' },
}

export default function GroupBanner({ group }: GroupBannerProps) {
  const type = group.type || (group.isAcademy ? 'academy' : 'friend')
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className="relative">
      {/* Banner image */}
      <div className="h-44 overflow-hidden">
        {group.bannerImage ? (
          <img src={group.bannerImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/30 via-navy-700 to-navy-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/30 to-transparent" />
      </div>

      {/* Avatar overlay */}
      <div className="absolute -bottom-8 left-4 flex items-end gap-4">
        <div className="w-20 h-20 rounded-2xl bg-navy-800 border-4 border-navy-900 flex items-center justify-center shadow-xl">
          {group.avatar ? (
            <img src={group.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
          ) : (
            <Icon size={32} className="text-accent" />
          )}
        </div>
      </div>

      {/* Info overlaid at bottom right */}
      <div className="absolute bottom-2 right-4 flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-sm ${config.bg}`}>
          {config.label}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-navy-800/80 text-gray-300 backdrop-blur-sm">
          {group.memberCount} members
        </span>
      </div>
    </div>
  )
}
