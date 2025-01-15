import { App } from "obsidian"
import { TaskObject } from "../formatTaskObject"
import { dateWithEmoji, getNextDayDate } from "src/utils/time"

export const askDate = async (app: App, task: TaskObject, today: string) => {
  const displayed = [
    "✏️ Personnaliser",
    "🤷 Ne pas encore donner de date",
    "📅 Demain",
    `🕔 Lundi prochain (${getNextDayDate('monday')})`,
    `🕔 Mardi prochain (${getNextDayDate('tuesday')})`,
    `🕔 Mercredi prochain (${getNextDayDate('wednesday')})`,
    `🕔 Jeudi prochain (${getNextDayDate('thursday')})`,
    `🕔 Vendredi prochain (${getNextDayDate('friday')})`,
    `🕔 Samedi prochain (${getNextDayDate('saturday')})`,
    `🕔 Dimanche prochain (${getNextDayDate('sunday')})`,
  ]
  const used = [
    "Personnalize",
    "No date",
    dateWithEmoji('tomorrow'),
    dateWithEmoji('monday'),
    dateWithEmoji('tuesday'),
    dateWithEmoji('wednesday'),
    dateWithEmoji('thursday'),
    dateWithEmoji('friday'),
    dateWithEmoji('saturday'),
    dateWithEmoji('sunday'),
  ]

  if (task.emojiProperties?.scheduled) {
    const recurringIsSameAsToday = task.emojiProperties?.scheduled === today
    if (!recurringIsSameAsToday) {
      displayed.unshift("⚡ Aujourd'hui")
      used.unshift(today)
    }
    displayed.unshift(`🏳️ Date par defaut (${recurringIsSameAsToday ? "⚡ Aujourd'hui" : task.emojiProperties?.scheduled.slice(2)})`)
    used.unshift(task.emojiProperties?.scheduled)
  } else {
    displayed.unshift("⚡ Aujourd'hui")
    used.unshift(today)
  }
  
  const answer = await openSuggester(app, {
    displayedValues: displayed,
    usedValues: used,
    title: 'Quel jour ?',
    description: `Date actuelle: ${moment().locale('fr').format('dddd').charAt(0).toUpperCase() + moment().locale('fr').format('dddd').slice(1)} ${today.slice(2)}`
  });

  if (!task.emojiProperties) task.emojiProperties = {}
  if (answer === 'Personnalize') {
    task.emojiProperties.scheduled = dateWithEmoji(await openDateModal(app, 'Selectionnez une date') || '')
  } else if (answer) {
    return task.emojiProperties.scheduled = answer
  } else {
    return task.emojiProperties.scheduled = undefined
  }
}