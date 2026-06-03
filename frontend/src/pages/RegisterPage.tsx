import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Public registration page for new users. */
export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /** Validate form and create a new account. */
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setLoading(true)
    try {
      await register(email, password, fullName)
      navigate('/profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось зарегистрироваться')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Регистрация</h1>
        <p className="muted">Создайте аккаунт для доступа к подбору вузов по ЕНТ</p>

        <label className="field">
          <span className="field-label">Имя</span>
          <input
            className="input"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>

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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Повторите пароль</span>
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {error && <div className="alert alert-error">{error}</div>}

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </button>

        <p className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </main>
  )
}
