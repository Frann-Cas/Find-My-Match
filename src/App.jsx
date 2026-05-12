import FindMyPartner from './pages/FindPartner'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PlayerDash from './pages/PlayerDash'
import RefereeDash from './pages/RefereeDash'
import CreateMatch from './pages/CreateMatch'
import LiveScoring from './pages/LiveScoring'
import ViewerPage from './pages/ViewerPage'
import AdminPanel from './pages/AdminPanel'
import FindPartner from './pages/FindPartner'
import LiveFeed from './pages/LiveFeed'
import Leaderboard from './pages/Leaderboard'

const PUBLIC_ROUTES = ['/live-feed', '/leaderboard', '/live', '/login', '/signup']

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>Loading...</div>
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function HomeRoute() {
  const { user, profile, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>Loading...</div>
  if (!user) return <Landing />
  const dash = profile?.role === 'referee' ? '/referee' : profile?.role === 'admin' ? '/admin' : '/dashboard'
  return <Navigate to={dash} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/live-feed" element={<LiveFeed />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/live/:token" element={<ViewerPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<HomeRoute />} />
      <Route path="/dashboard" element={<PrivateRoute><PlayerDash /></PrivateRoute>} />
      <Route path="/create-match" element={<PrivateRoute><CreateMatch /></PrivateRoute>} />
      <Route path="/referee" element={<PrivateRoute><RefereeDash /></PrivateRoute>} />
      <Route path="/score/:matchId" element={<PrivateRoute><LiveScoring /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="/find-partner" element={<PrivateRoute><FindPartner /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}