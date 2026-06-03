import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Authenticated user profile page. */
export function ProfilePage() {
  const { user, logout, isAdmin } = useAuth()

  if (!user) return null

  return (
    <main className="page">
      <header className="page-hero">
        <p className="page-eyebrow">Профиль</p>
        <h1>{user.full_name}</h1>
        <p className="page-lead">{user.email}</p>
      </header>

      <section className="profile-card">
        <div className="profile-row">
          <span className="profile-label">Роль</span>
          <span className="badge badge-blue">{isAdmin ? 'Администратор' : 'Пользователь'}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Дата регистрации</span>
          <span>{new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
        </div>

        <div className="profile-actions">
          {isAdmin && (
            <Link to="/admin" className="btn btn-secondary">
              Перейти в админ-панель
            </Link>
          )}
          <button type="button" className="btn btn-primary" onClick={logout}>
            Выйти
          </button>
        </div>
      </section>
    </main>
  )
}

/** Redirect unauthenticated visitors to the login page. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="page">
        <p className="loading-text">Загрузка…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login?redirect=/profile" replace />
  }

  return children
}
