import { App, moment } from "obsidian";
import { durationFromStartTime, timeFromTask } from "src/utils/time";
import { TaskObject } from "../formatTaskObject";
import { openSuggester } from "src/modal/suggesterModal";
import { openHourModal } from "src/modal/hourModal";
import { RecentTaskChoosen, TasksByClosenessToNow } from "../sortTasksByClosenessToNow";
import { askChooseRecentTask } from "./askChooseRecentTask";

export const askStart = async (app: App, task: TaskObject, tasksByClosenessToNow: TasksByClosenessToNow | null, recentTaskChoosen: RecentTaskChoosen,  today: string, now: string): Promise<string | undefined> => {
  const hasRecentTask = (tasksByClosenessToNow?.timeSorted.length || 0) > 0

  let used = [
    "Personnalize",
    "No start",
    durationFromStartTime(now, 5),
    durationFromStartTime(now, 10),
    durationFromStartTime(now, 15),
    durationFromStartTime(now, 20),
    durationFromStartTime(now, 25),
    durationFromStartTime(now, 30),
    durationFromStartTime(now, 45),
    durationFromStartTime(now, 60),
  ]
  let displayed = [
    `✏️ Personnaliser`,
    `🤷 Ne pas encore donner d'heure de début`,
    `🕔 Dans 5 minutes (${used[2]})`,
    `🕔 Dans 10 minutes (${used[3]})`,
    `🕔 Dans 15 minutes (${used[4]})`,
    `🕔 Dans 20 minutes (${used[5]})`,
    `🕔 Dans 25 minutes (${used[6]})`,
    `🕔 Dans 30 minutes (${used[7]})`,
    `🕔 Dans 45 minutes (${used[8]})`,
    `🕔 Dans 60 minutes (${used[9]})`,
  ]

  if (hasRecentTask) {
    displayed.splice(2, 0, `🩹 À la suite d'une tâche récente`)
    used.splice(2, 0, "Recent task")
  }

  if (task.start) {
    const recurringIsSameAsNow = (task.start === now)

    if (!recurringIsSameAsNow) {
      displayed.unshift("⚡ Maintenant")
      used.unshift(now)
    } 
    displayed.unshift(`🏳️ Heure par defaut (${recurringIsSameAsNow ? "⚡ Maintenant" : task.start})`)
    used.unshift(task.start)
  } else {
    displayed.unshift("⚡ Maintenant")
    used.unshift(now)
  }

  if (task.emojiProperties?.scheduled !== today) {
    displayed = ["🤷 Ne pas encore donner d'heure de début", "✏️ Personnaliser"]
    used = ["No start", "Personnalize"]
  } 

  const answer = !task.emojiProperties?.scheduled && !task.start 
  ? "No start" 
  : await openSuggester(app, {
    displayedValues: displayed,
    usedValues: used,
    title: 'Quelle heure de début ?',
    description: `Heure actuelle: ${now}`
  })

  if (answer === "Personnalize") {
    return task.start = await openHourModal(app, 'Renseignez une heure') || undefined
  } else if (answer === "Recent task" && tasksByClosenessToNow) {
    recentTaskChoosen.value = await askChooseRecentTask(app, tasksByClosenessToNow, false, now)
    if (!recentTaskChoosen.value) return

    return task.start = timeFromTask(recentTaskChoosen.value, "after", "end")
  } else {
    return task.start = answer?.toString()
  }
}