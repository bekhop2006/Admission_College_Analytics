/** RNMC College Analytics — Express API entry point. */

import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { initSchema } from './db.js'
import { adminRouter } from './routes/admin.js'
import { authRouter } from './routes/auth.js'
import { statsRouter } from './routes/stats.js'
import { universitiesRouter } from './routes/universities.js'
import { seedDatabase } from './seed.js'

initSchema()
seedDatabase()

const app = express()

app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'rnmc-college-analytics' })
})

app.use('/api/auth', authRouter)
app.use('/api/universities', universitiesRouter)
app.use('/api/admin', adminRouter)
app.use('/api/stats', statsRouter)

app.listen(config.port, '0.0.0.0', () => {
  console.log(`RNMC API running on http://0.0.0.0:${config.port}`)
})
