/** Seed admin user and import official NCT data on first run. */

import { config } from './config.js'
import { countPrograms, findUserByEmail, insertUser } from './db.js'
import { hashPassword } from './auth.js'
import { importNctData } from './import/nct-import.js'

/** Ensure admin exists and load NCT thresholds when database is empty. */
export function seedDatabase(): void {
  if (!findUserByEmail(config.adminEmail)) {
    insertUser(config.adminEmail, hashPassword(config.adminPassword), 'RNMC Admin', 'admin')
  }

  if (countPrograms() === 0) {
    const result = importNctData({ reset: true })
    console.log(`Imported ${result.universities} universities and ${result.programs} programs from NCT data`)
  }
}
