import { Navigate, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import { HomePage } from './pages/HomePage'
import { UniversityDetailPage } from './pages/UniversityDetailPage'
import { AdminGuard, AdminLayout } from './pages/admin/AdminLayout'
import { DashboardPage } from './pages/admin/DashboardPage'
import { LoginPage } from './pages/admin/LoginPage'
import { UniversitiesAdminPage } from './pages/admin/UniversitiesAdminPage'

/** Root router for public search and admin panel. */
function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/universities/:id" element={<UniversityDetailPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route element={<AdminGuard />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="universities" element={<UniversitiesAdminPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
