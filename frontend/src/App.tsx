import { Navigate, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { LoginPage } from './pages/LoginPage'
import { AuthGuard, ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { UniversityDetailPage } from './pages/UniversityDetailPage'
import { AdminGuard, AdminLayout } from './pages/admin/AdminLayout'
import { DashboardPage } from './pages/admin/DashboardPage'
import { AdminLoginRedirect } from './pages/admin/LoginPage'
import { UniversitiesAdminPage } from './pages/admin/UniversitiesAdminPage'

/** Root router for public search, auth, and admin panel. */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/universities/:id" element={<UniversityDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
            />
            <Route path="/admin/login" element={<AdminLoginRedirect />} />
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
    </ThemeProvider>
  )
}

export default App
