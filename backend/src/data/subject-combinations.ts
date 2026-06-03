/** ENT profile subject combinations mapped to GOP codes (official NCT file). */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GOP_SUBJECTS_FILE = path.resolve(__dirname, '../../data/gop-subjects.xlsx')

export interface SubjectCombination {
  id: string
  label: string
  gopCodes: string[]
  specialties: string[]
}

/** Build a stable URL-safe id from a combination label. */
function combinationToId(label: string): string {
  return label
    .toLowerCase()
    .replace(/\s*-\s*/g, '--')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яё\-]/gi, '')
}

/** Parse the official GOP ↔ subject combination Excel file. */
function parseGopSubjectsFile(filePath = GOP_SUBJECTS_FILE): SubjectCombination[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`GOP subjects file not found: ${filePath}`)
  }

  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, defval: '' })

  const byLabel = new Map<string, { gopCodes: Set<string>; specialties: Set<string> }>()

  for (const row of rows.slice(4)) {
    const gopCode = String(row[1] ?? '').trim()
    const specialtyName = String(row[3] ?? '').trim()
    const combinationLabel = String(row[7] ?? '').trim()
    if (!gopCode || !combinationLabel || !specialtyName) continue

    if (!byLabel.has(combinationLabel)) {
      byLabel.set(combinationLabel, { gopCodes: new Set(), specialties: new Set() })
    }
    const entry = byLabel.get(combinationLabel)!
    entry.gopCodes.add(gopCode)
    entry.specialties.add(specialtyName)
  }

  return [...byLabel.entries()]
    .map(([label, data]) => ({
      id: combinationToId(label),
      label,
      gopCodes: [...data.gopCodes].sort(),
      specialties: [...data.specialties].sort((a, b) => a.localeCompare(b, 'ru')),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ru'))
}

/** All ENT profile subject combinations loaded from the official NCT mapping. */
export const SUBJECT_COMBINATIONS: SubjectCombination[] = parseGopSubjectsFile()

/** Find a subject combination by its id. */
export function findSubjectCombination(combinationId: string): SubjectCombination | undefined {
  return SUBJECT_COMBINATIONS.find((item) => item.id === combinationId)
}

/** Return GOP codes allowed for the given combination id. */
export function gopCodesForCombination(combinationId: string): string[] {
  return findSubjectCombination(combinationId)?.gopCodes ?? []
}

/** Return specialty (GOP) names for the given combination id. */
export function specialtiesForCombination(combinationId: string): string[] {
  return findSubjectCombination(combinationId)?.specialties ?? []
}

/** Check whether a program GOP code belongs to the selected combination. */
export function programMatchesCombination(gopCode: string | null, combinationId: string): boolean {
  if (!gopCode) return false
  const allowed = gopCodesForCombination(combinationId)
  return allowed.includes(gopCode)
}
