import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/** Guard admin routes — redirect to login when unauthenticated. */
export function AdminGuard() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <Outlet />
}

/** Layout wrapper for admin sub-pages. */
export function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Админ</h2>
        <nav>
          <NavLink to="/admin" end>
            Дашборд
          </NavLink>
          <NavLink to="/admin/universities">Вузы</NavLink>
        </nav>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}
