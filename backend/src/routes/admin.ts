/** Admin CRUD and CSV import routes. */

import { parse } from 'csv-parse/sync'
import { Router } from 'express'
import multer from 'multer'
import { requireAdmin } from '../auth.js'
import {
  deleteUniversity,
  findUniversityById,
  findUniversityByNameCity,
  insertProgram,
  insertUniversity,
  listUniversities,
  updateUniversity,
  withPrograms,
} from '../db.js'

export const adminRouter = Router()
const upload = multer({ storage: multer.memoryStorage() })

adminRouter.use(requireAdmin)

/** List all universities with nested programs for admin UI. */
adminRouter.get('/universities', (_req, res) => {
  const items = listUniversities().map((row) => withPrograms(row))
  res.json(items)
})

/** Create a new university. */
adminRouter.post('/universities', (req, res) => {
  const { name, city, institution_type, min_ent_score, website, description } = req.body as Record<
    string,
    unknown
  >

  if (!name || !city || min_ent_score == null) {
    res.status(400).json({ detail: 'name, city and min_ent_score are required' })
    return
  }

  const university = insertUniversity({
    name: String(name),
    city: String(city),
    institution_type: String(institution_type ?? 'university'),
    min_ent_score: Number(min_ent_score),
    website: website ? String(website) : null,
    description: description ? String(description) : null,
  })

  res.status(201).json(withPrograms(university))
})

/** Update university fields by id. */
adminRouter.put('/universities/:id', (req, res) => {
  const id = Number(req.params.id)
  const existing = findUniversityById(id)
  if (!existing) {
    res.status(404).json({ detail: 'University not found' })
    return
  }

  const body = req.body as Record<string, unknown>
  const updated = {
    name: body.name != null ? String(body.name) : existing.name,
    city: body.city != null ? String(body.city) : existing.city,
    institution_type:
      body.institution_type != null ? String(body.institution_type) : existing.institution_type,
    min_ent_score: body.min_ent_score != null ? Number(body.min_ent_score) : existing.min_ent_score,
    website: body.website !== undefined ? (body.website ? String(body.website) : null) : existing.website,
    description:
      body.description !== undefined
        ? body.description
          ? String(body.description)
          : null
        : existing.description,
  }

  const row = updateUniversity(id, updated)
  if (!row) {
    res.status(404).json({ detail: 'University not found' })
    return
  }
  res.json(withPrograms(row))
})

/** Delete university by id. */
adminRouter.delete('/universities/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!deleteUniversity(id)) {
    res.status(404).json({ detail: 'University not found' })
    return
  }
  res.status(204).send()
})

/** Import universities/programs from uploaded CSV file. */
adminRouter.post('/import/csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ detail: 'CSV file is required' })
    return
  }

  const content = req.file.buffer.toString('utf-8').replace(/^\uFEFF/, '')
  let rows: Record<string, string>[]
  try {
    rows = parse(content, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[]
  } catch {
    res.status(400).json({ detail: 'Invalid CSV format' })
    return
  }

  const required = ['name', 'city', 'min_ent_score']
  if (rows.length === 0 || !required.every((col) => col in rows[0])) {
    res.status(400).json({
      detail:
        'CSV must include columns: name, city, min_ent_score (optional: program_name, program_min_ent, institution_type, website)',
    })
    return
  }

  let createdUniversities = 0
  let createdPrograms = 0

  for (const row of rows) {
    const name = row.name?.trim()
    const city = row.city?.trim()
    if (!name || !city) continue

    const minEnt = Number(row.min_ent_score || 0)
    let university = findUniversityByNameCity(name, city)
    if (!university) {
      university = insertUniversity({
        name,
        city,
        min_ent_score: minEnt,
        institution_type: row.institution_type || 'university',
        website: row.website || null,
        description: null,
      })
      createdUniversities += 1
    }

    const programName = row.program_name?.trim()
    if (programName) {
      insertProgram({
        university_id: university.id,
        name: programName,
        specialty_code: row.specialty_code || null,
        language: 'kaz/ru',
        min_ent_score: Number(row.program_min_ent || minEnt),
        grant_min_ent_score: null,
      })
      createdPrograms += 1
    }
  }

  res.json({
    message: 'Import completed',
    created_universities: createdUniversities,
    created_programs: createdPrograms,
  })
})
