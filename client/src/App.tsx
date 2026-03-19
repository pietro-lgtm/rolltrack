import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { useAuth } from './context/AuthContext'

// Auth pages (not lazy - should load fast)
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'

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
const TrainingLog = lazy(() => import('./pages/TrainingLog'))
const Settings = lazy(() => import('./pages/Settings'))
const AcademyCreate = lazy(() => import('./pages/AcademyCreate'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth routes (no protection) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Main tab layout (with bottom nav) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/record" element={<Record />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/log" element={<TrainingLog />} />
        </Route>

        {/* Pages without bottom nav */}
        <Route path="/map/academy/create" element={<ProtectedRoute><AcademyCreate /></ProtectedRoute>} />
        <Route path="/map/academy/:id" element={<ProtectedRoute><AcademyDetail /></ProtectedRoute>} />
        <Route path="/record/summary/:id" element={<ProtectedRoute><SessionSummary /></ProtectedRoute>} />
        <Route path="/session/:id" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
        <Route path="/groups/create" element={<ProtectedRoute><GroupCreate /></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
        <Route path="/groups/:id/event/:eid" element={<ProtectedRoute><GroupEvent /></ProtectedRoute>} />
        <Route path="/profile/friends" element={<ProtectedRoute><FriendsList /></ProtectedRoute>} />
        <Route path="/profile/share/:id" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
