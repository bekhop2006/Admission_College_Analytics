import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

/** Admin login form. */
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@rnmc.kz')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /** Submit credentials and redirect to admin dashboard. */
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const token = await loginAdmin(email, password)
      login(token.access_token)
      navigate('/admin')
    } catch {
      setError('Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Вход администратора</h1>
        <p className="muted">RNMC College Analytics</p>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </main>
  )
}
