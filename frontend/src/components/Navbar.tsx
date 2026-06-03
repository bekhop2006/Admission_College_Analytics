import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Top navigation for public and admin areas. */
export function Navbar() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">RNMC</span>
        <span className="brand-text">College Analytics</span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>
          Подбор по ЕНТ
        </NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to="/admin">Админ</NavLink>
            <button type="button" className="btn-link" onClick={logout}>
              Выйти
            </button>
          </>
        ) : (
          <NavLink to="/admin/login">Вход</NavLink>
        )}
      </nav>
    </header>
  )
}
