import { App, moment } from 'obsidian'
import { openOrCreateFile } from 'src/utils/openOrCreateFile'

export const openWeeklyNote = async (app: App) => {
  const weekNumber = moment().format('WW')
  const filePath = `daily/${moment().format('YYYY')}/${moment().format('MM')}/${weekNumber}/📌 Weekly Note - ${weekNumber}.md`

  return await openOrCreateFile(app, filePath, "preview", '_src/templates/Weekly Note.md')
}