import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Public login page for all users. */
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /** Submit credentials and redirect after successful login. */
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      navigate(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Вход</h1>
        <p className="muted">Войдите, чтобы сохранять поиск и управлять профилем</p>

        <label className="field">
          <span className="field-label">Email</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Пароль</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <div className="alert alert-error">{error}</div>}

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Вход…' : 'Войти'}
        </button>

        <p className="auth-switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </main>
  )
}
