import { Link, NavLink } from 'react-router-dom'
import { BookOpenIcon } from './icons/BookOpenIcon'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../context/AuthContext'

/** Top navigation for public and admin areas. */
export function Navbar() {
  const { user, isAdmin, logout, loading } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <BookOpenIcon size={22} />
          </span>
          <span className="brand-text">
            <strong>College Analytics</strong>
            <small>Подбор по ЕНТ</small>
          </span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Главная
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Поиск
          </NavLink>

          {!loading && user ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                {user.full_name.split(' ')[0]}
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  Админ
                </NavLink>
              )}
              <button type="button" className="nav-link nav-link-button" onClick={logout}>
                Выйти
              </button>
            </>
          ) : !loading ? (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Вход
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Регистрация
              </NavLink>
            </>
          ) : null}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
