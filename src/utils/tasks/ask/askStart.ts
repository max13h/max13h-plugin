import { App, moment } from "obsidian";
import { timeFromDurationAndStartTime, timeFromTask } from "src/utils/time";
import { TaskObject } from "../formatTaskObject";
import { openSuggester } from "src/modal/suggesterModal";
import { openHourModal } from "src/modal/hourModal";
import { RecentTaskChoosen, TasksByClosenessToNow } from "../sortTasksByClosenessToNow";
import { askChooseRecentTask } from "./askChooseRecentTask";

export const askStart = async (app: App, task: TaskObject, tasksByClosenessToNow: TasksByClosenessToNow | null, recentTaskChoosen: RecentTaskChoosen,  todayWithEmoji: string, now: string, isModifying: boolean = false): Promise<string | undefined> => {
  const hasRecentTask = (tasksByClosenessToNow?.timeSorted.length || 0) > 0

  let used = [
    "Personnalize",
    "No start",
    timeFromDurationAndStartTime(now, 5, "after"),
    timeFromDurationAndStartTime(now, 10, "after"),
    timeFromDurationAndStartTime(now, 15, "after"),
    timeFromDurationAndStartTime(now, 20, "after"),
    timeFromDurationAndStartTime(now, 25, "after"),
    timeFromDurationAndStartTime(now, 30, "after"),
    timeFromDurationAndStartTime(now, 45, "after"),
    timeFromDurationAndStartTime(now, 60, "after"),
    timeFromDurationAndStartTime(now, 5, "before"),
    timeFromDurationAndStartTime(now, 10, "before"),
    timeFromDurationAndStartTime(now, 15, "before"),
    timeFromDurationAndStartTime(now, 20, "before"),
    timeFromDurationAndStartTime(now, 25, "before"),
    timeFromDurationAndStartTime(now, 30, "before"),
    timeFromDurationAndStartTime(now, 45, "before"),
    timeFromDurationAndStartTime(now, 60, "before"),
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
    `⌛ Il y a 5 minutes (${used[10]})`,
    `⌛ Il y a 10 minutes (${used[11]})`,
    `⌛ Il y a 15 minutes (${used[12]})`,
    `⌛ Il y a 20 minutes (${used[13]})`,
    `⌛ Il y a 25 minutes (${used[14]})`,
    `⌛ Il y a 30 minutes (${used[15]})`,
    `⌛ Il y a 45 minutes (${used[16]})`,
    `⌛ Il y a 60 minutes (${used[17]})`,
  ]

  if (hasRecentTask) {
    displayed.splice(2, 0, `🩹 À la suite d'une tâche récente`)
    used.splice(2, 0, "Recent task")
  }

  if (!isModifying && task.start) {
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

  if (!isModifying && task.emojiProperties?.scheduled !== todayWithEmoji) {
    displayed = ["🤷 Ne pas encore donner d'heure de début", "✏️ Personnaliser"]
    used = ["No start", "Personnalize"]
  }

  if (isModifying && task.start) {
    displayed.unshift(`Garder l'heure actuelle (${task.start})`)
    used.unshift("Keep actual")
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
    recentTaskChoosen.value = await askChooseRecentTask(app, task, tasksByClosenessToNow, false, now)
    if (!recentTaskChoosen.value) return

    return task.start = timeFromTask(recentTaskChoosen.value, "after", "end")
  } else if (answer === "Keep actual") {
    return task.start = task.start
  } else {
    return task.start = answer?.toString()
  }
}