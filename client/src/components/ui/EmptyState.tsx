import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export default function EmptyState({ icon: Icon, title, message, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-gray-400 max-w-xs mb-4">{message}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
      {children}
    </div>
  )
}
