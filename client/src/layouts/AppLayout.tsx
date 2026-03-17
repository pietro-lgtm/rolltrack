import { Outlet, NavLink } from 'react-router-dom'
import { Home, Map, CirclePlus, Users, User } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/record', icon: CirclePlus, label: 'Record', isCenter: true },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/profile', icon: User, label: 'You' },
]

export default function AppLayout() {
  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto relative">
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 z-50 safe-area-bottom">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
          {navItems.map(({ to, icon: Icon, label, isCenter }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-500'
                    : 'text-gray-500 hover:text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isCenter ? (
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center -mt-4 shadow-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Icon size={22} />
                    </div>
                  ) : (
                    <Icon size={20} />
                  )}
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
