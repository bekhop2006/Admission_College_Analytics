import { useTheme } from '../context/ThemeContext'

/** Toggle button for light and dark theme modes. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
      title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
    >
      {theme === 'light' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3a1 1 0 0 1 1 1v1.2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 15.8a1 1 0 0 1 1 1V21a1 1 0 1 1-2 0v-1.2a1 1 0 0 1 1-1ZM4 12a1 1 0 0 1 1-1h1.2a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm15.8 0a1 1 0 0 1 1-1H21a1 1 0 1 1 0 2h-1.2a1 1 0 0 1-1-1ZM6.34 6.34a1 1 0 0 1 1.41 0l.85.85a1 1 0 1 1-1.41 1.41l-.85-.85a1 1 0 0 1 0-1.41Zm10 10a1 1 0 0 1 1.41 0l.85.85a1 1 0 0 1-1.41 1.41l-.85-.85a1 1 0 0 1 0-1.41ZM17.66 6.34a1 1 0 0 1 0 1.41l-.85.85a1 1 0 1 1-1.41-1.41l.85-.85a1 1 0 0 1 1.41 0ZM7.59 16.34a1 1 0 0 1 0 1.41l-.85.85a1 1 0 0 1-1.41-1.41l.85-.85a1 1 0 0 1 1.41 0ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 14.5A7.5 7.5 0 0 1 9.5 3 6.5 6.5 0 1 0 21 14.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
