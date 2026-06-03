/** Public university search and detail routes. */

import { Router } from 'express'
import {
  findSubjectCombination,
  programMatchesCombination,
  specialtiesForCombination,
  SUBJECT_COMBINATIONS,
} from '../data/subject-combinations.js'
import {
  findUniversityById,
  getProgramsByUniversity,
  listCities,
  listSpecialties,
  listUniversitiesFiltered,
  withPrograms,
} from '../db.js'
import type { ProgramRow } from '../types.js'

export const universitiesRouter = Router()

/** Filter programs by ENT score, subject combination, and specialty name. */
function filterPrograms(
  programs: ProgramRow[],
  entScore: number,
  combinationId?: string,
  specialty?: string,
): ProgramRow[] {
  const specialtyLower = specialty?.trim().toLowerCase()

  return programs.filter((program) => {
    if (program.min_ent_score > entScore) return false
    if (combinationId && !programMatchesCombination(program.gop_code, combinationId)) return false
    if (specialtyLower && program.name.toLowerCase() !== specialtyLower) return false
    return true
  })
}

/** Build list item with program match counts for ENT search results. */
function toListItem(
  university: ReturnType<typeof withPrograms>,
  entScore: number,
  combinationId?: string,
  specialty?: string,
) {
  const matched = filterPrograms(university.programs, entScore, combinationId, specialty)
  return {
    id: university.id,
    name: university.name,
    city: university.city,
    institution_type: university.institution_type,
    min_ent_score: university.min_ent_score,
    website: university.website,
    program_count: university.programs.length,
    matching_programs: matched.length,
  }
}

/** Search universities/colleges available for the given ENT score and filters. */
universitiesRouter.get('/search', (req, res) => {
  const entScore = Number(req.query.ent_score)
  if (Number.isNaN(entScore) || entScore < 0 || entScore > 140) {
    res.status(422).json({ detail: 'ent_score must be between 0 and 140' })
    return
  }

  const city = typeof req.query.city === 'string' ? req.query.city : undefined
  const institutionType =
    typeof req.query.institution_type === 'string' ? req.query.institution_type : undefined
  const combination =
    typeof req.query.combination === 'string' ? req.query.combination : undefined
  const specialty = typeof req.query.specialty === 'string' ? req.query.specialty : undefined

  if (combination && !findSubjectCombination(combination)) {
    res.status(422).json({ detail: 'Unknown subject combination' })
    return
  }

  const rows = listUniversitiesFiltered(city, institutionType)
  const matches = rows
    .map((row) => withPrograms(row))
    .filter((uni) => filterPrograms(uni.programs, entScore, combination, specialty).length > 0)
    .map((uni) => toListItem(uni, entScore, combination, specialty))

  res.json({
    ent_score: entScore,
    combination: combination ?? null,
    specialty: specialty ?? null,
    total_matches: matches.length,
    universities: matches,
  })
})

/** Return ENT profile subject combinations for the search form. */
universitiesRouter.get('/combinations', (_req, res) => {
  res.json(SUBJECT_COMBINATIONS.map(({ id, label }) => ({ id, label })))
})

/** Return specialty names for the search form, optionally scoped to a combination. */
universitiesRouter.get('/specialties', (req, res) => {
  const combination =
    typeof req.query.combination === 'string' ? req.query.combination : undefined

  if (combination) {
    if (!findSubjectCombination(combination)) {
      res.status(422).json({ detail: 'Unknown subject combination' })
      return
    }
    res.json(specialtiesForCombination(combination))
    return
  }

  res.json(listSpecialties())
})

/** Return distinct cities for frontend filters. */
universitiesRouter.get('/cities', (_req, res) => {
  res.json(listCities())
})

/** List all programs for a university without ENT filtering. */
universitiesRouter.get('/:universityId/programs', (req, res) => {
  const universityId = Number(req.params.universityId)
  const university = findUniversityById(universityId)
  if (!university) {
    res.status(404).json({ detail: 'University not found' })
    return
  }
  res.json(getProgramsByUniversity(universityId))
})

/** Return one university; optionally filter programs by ENT score and filters. */
universitiesRouter.get('/:universityId', (req, res) => {
  const universityId = Number(req.params.universityId)
  const entScoreRaw = req.query.ent_score
  const entScore = entScoreRaw != null ? Number(entScoreRaw) : undefined
  const combination =
    typeof req.query.combination === 'string' ? req.query.combination : undefined
  const specialty = typeof req.query.specialty === 'string' ? req.query.specialty : undefined

  const university = findUniversityById(universityId)
  if (!university) {
    res.status(404).json({ detail: 'University not found' })
    return
  }

  const full = withPrograms(university)
  if (entScore != null && !Number.isNaN(entScore)) {
    full.programs = filterPrograms(full.programs, entScore, combination, specialty)
  }

  res.json(full)
})
