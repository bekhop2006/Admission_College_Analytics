import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/** Guard admin routes — require authenticated admin user. */
export function AdminGuard() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <main className="page">
        <p className="loading-text">Загрузка…</p>
      </main>
    )
  }

  if (!user) return <Navigate to="/login?redirect=/admin" replace />
  if (!isAdmin) return <Navigate to="/" replace />

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
