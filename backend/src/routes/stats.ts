/** Dashboard statistics routes. */

import { Router } from 'express'
import { requireAdmin } from '../auth.js'
import { getDashboardStats } from '../db.js'

export const statsRouter = Router()

/** Return aggregate metrics for the admin dashboard. */
statsRouter.get('/dashboard', requireAdmin, (_req, res) => {
  res.json(getDashboardStats())
})

/** Return public aggregate metrics for the landing page. */
statsRouter.get('/public', (_req, res) => {
  const stats = getDashboardStats()
  res.json({
    universities_count: stats.universities_count,
    programs_count: stats.programs_count,
    cities_count: stats.cities_count,
    combinations_count: 17,
    source_year: 2024,
  })
})
