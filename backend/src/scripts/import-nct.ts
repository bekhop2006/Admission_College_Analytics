/** CLI script to import or refresh NCT threshold data. */

import { initSchema } from '../db.js'
import { importNctData } from '../import/nct-import.js'

initSchema()
const result = importNctData({ reset: true })
console.log(`Imported ${result.universities} universities and ${result.programs} specialty thresholds`)
