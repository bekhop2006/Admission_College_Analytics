/** Application configuration from environment variables. */

export const config = {
  port: Number(process.env.PORT ?? 8000),
  databasePath: process.env.DATABASE_PATH ?? './rnmc.db',
  secretKey: process.env.SECRET_KEY ?? 'change-me-in-production-rnmc-2026',
  jwtExpiresMinutes: Number(process.env.JWT_EXPIRES_MINUTES ?? 480),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@rnmc.kz',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
}
