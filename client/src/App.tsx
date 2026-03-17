import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy-loaded tab pages (main navigation)
const Home = lazy(() => import('./pages/Home'))
const MapPage = lazy(() => import('./pages/MapPage'))
const Record = lazy(() => import('./pages/Record'))
const Groups = lazy(() => import('./pages/Groups'))
const Profile = lazy(() => import('./pages/Profile'))

// Lazy-loaded detail/secondary pages
const AcademyDetail = lazy(() => import('./pages/AcademyDetail'))
const SessionDetail = lazy(() => import('./pages/SessionDetail'))
const SessionSummary = lazy(() => import('./pages/SessionSummary'))
const GroupCreate = lazy(() => import('./pages/GroupCreate'))
const GroupDetail = lazy(() => import('./pages/GroupDetail'))
const GroupEvent = lazy(() => import('./pages/GroupEvent'))
const FriendsList = lazy(() => import('./pages/FriendsList'))
const Settings = lazy(() => import('./pages/Settings'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Main tab layout (with bottom nav) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/record" element={<Record />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/log" element={<Profile />} />
        </Route>

        {/* Pages without bottom nav */}
        <Route path="/map/academy/:id" element={<AcademyDetail />} />
        <Route path="/record/summary/:id" element={<SessionSummary />} />
        <Route path="/session/:id" element={<SessionDetail />} />
        <Route path="/groups/create" element={<GroupCreate />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/groups/:id/event/:eid" element={<GroupEvent />} />
        <Route path="/profile/friends" element={<FriendsList />} />
        <Route path="/profile/share/:id" element={<SessionDetail />} />
        <Route path="/settings" element={<Settings />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
