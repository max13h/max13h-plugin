import { App, moment } from "obsidian";
import { TaskObject } from "../formatTaskObject";
import { timeFromDurationAndStartTime } from "src/utils/time";
import { openSuggester } from "src/modal/suggesterModal";
import { openHourModal } from "src/modal/hourModal";

export const askDuration = async (app: App, task: TaskObject, defaultTaskDuration: number, now: string, isModifying: boolean = false) => {
  if (!task.start) throw new Error("Task has no start time");

  const used = [
    'Personnalize',
    timeFromDurationAndStartTime(now, 5, "after"),
    timeFromDurationAndStartTime(now, 10, "after"),
    timeFromDurationAndStartTime(now, 15, "after"),
    timeFromDurationAndStartTime(now, 20, "after"),
    timeFromDurationAndStartTime(now, 25, "after"),
    timeFromDurationAndStartTime(now, 30, "after"),
    timeFromDurationAndStartTime(now, 45, "after"),
    timeFromDurationAndStartTime(now, 60, "after")
  ] 

  const displayed = [
    '✏️ Personnaliser',
    `🕔 Dans 5 minutes (${used[1]})`,
    `🕔 Dans 10 minutes (${used[2]})`,
    `🕔 Dans 15 minutes (${used[3]})`,
    `🕔 Dans 20 minutes (${used[4]})`,
    `🕔 Dans 25 minutes (${used[5]})`,
    `🕔 Dans 30 minutes (${used[6]})`,
    `🕔 Dans 45 minutes (${used[7]})`,
    `🕔 Dans 60 minutes (${used[8]})`
  ]

  const momentStart = moment(task.start, "HH:mm")
  const momentNow = moment(now, "HH:mm")
  const isTaskStartBeforeNow = momentStart.diff(momentNow) < 0

  if (isTaskStartBeforeNow) {
    used.unshift(now)
    displayed.unshift('⚡ Finir maintenant')
  }

  const isTaskStartBeforeOneHour = momentStart.diff(momentNow.subtract(1, "hour").subtract(1, "minute")) < 0
  if (isTaskStartBeforeOneHour) {
    const addedUsed = [
      timeFromDurationAndStartTime(now, 5, "before"),
      timeFromDurationAndStartTime(now, 10, "before"),
      timeFromDurationAndStartTime(now, 15, "before"),
      timeFromDurationAndStartTime(now, 20, "before"),
      timeFromDurationAndStartTime(now, 25, "before"),
      timeFromDurationAndStartTime(now, 30, "before"),
      timeFromDurationAndStartTime(now, 45, "before"),
      timeFromDurationAndStartTime(now, 60, "before"),
    ]
    const addedDisplayed = [
      `⌛ Il y a 5 minutes (${addedUsed[0]})`,
      `⌛ Il y a 10 minutes (${addedUsed[1]})`,
      `⌛ Il y a 15 minutes (${addedUsed[2]})`,
      `⌛ Il y a 20 minutes (${addedUsed[3]})`,
      `⌛ Il y a 25 minutes (${addedUsed[4]})`,
      `⌛ Il y a 30 minutes (${addedUsed[5]})`,
      `⌛ Il y a 45 minutes (${addedUsed[6]})`,
      `⌛ Il y a 60 minutes (${addedUsed[7]})`,
    ]

    displayed.push(...addedDisplayed)
    used.push(...addedUsed)
  }

  if (task.end && defaultTaskDuration) {
    const time = timeFromDurationAndStartTime(task.start, defaultTaskDuration, "after")
    used.unshift(time)
    displayed.unshift(`🏳️ Durée par défaut (end: ${time})`)
  } else {
    const time = timeFromDurationAndStartTime(task.start, 30, "after")
    used.unshift(time)
    displayed.unshift(`🏳️ Durée par défaut (30 minutes) (end: ${time})`)
  }

  if (isModifying && task.end) {
    displayed.unshift(`Garder l'heure actuelle (${task.end})`)
    used.unshift("Keep actual")
  }

  const answer = await openSuggester(app, {
    displayedValues: displayed,
    usedValues: used,
    title: `Quelle durée ?`,
    description: `Heure de début ${task.start}`
  }) || undefined;

  if (answer === "Personnalize") {
    return task.end = await openHourModal(app, 'Renseignez une heure') || undefined
  } else if (answer === "Keep actual") {
    return task.end = task.end
  } else {
    return task.end = answer
  }
}