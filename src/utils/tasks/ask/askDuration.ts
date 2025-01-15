import { App } from "obsidian";
import { TaskObject } from "../formatTaskObject";
import { durationFromStartTime } from "src/utils/time";
import { openSuggester } from "src/modal/suggesterModal";
import { openHourModal } from "src/modal/hourModal";

export const askDuration = async (app: App, task: TaskObject, defaultTaskDuration: number, now: string) => {
  if (!task.start) throw new Error("Task has no start time");

  const used = [
    'Personnalize',
    durationFromStartTime(task.start, 5),
    durationFromStartTime(task.start, 10),
    durationFromStartTime(task.start, 15),
    durationFromStartTime(task.start, 20),
    durationFromStartTime(task.start, 25),
    durationFromStartTime(task.start, 30),
    durationFromStartTime(task.start, 45),
    durationFromStartTime(task.start, 60),
  ] 

  const displayed = [
    '✏️ Personnaliser',
    `🕔 5 minutes (end: ${used[1]})`,
    `🕔 10 minutes (end: ${used[2]})`,
    `🕔 15 minutes (end: ${used[3]})`,
    `🕔 20 minutes (end: ${used[4]})`,
    `🕔 25 minutes (end: ${used[5]})`,
    `🕔 30 minutes (end: ${used[6]})`,
    `🕔 45 minutes (end: ${used[7]})`,
    `🕔 60 minutes (end: ${used[8]})`,
  ]

  if (task.start !== now) {
    used.unshift(now)
    displayed.unshift('⚡ Maintenant')
  }

  if (task.end && defaultTaskDuration) {
    const time = durationFromStartTime(task.start, defaultTaskDuration)
    used.unshift(time)
    displayed.unshift(`🏳️ Durée par défaut (end: ${time})`)
  } else {
    const time = durationFromStartTime(task.start, 30)
    used.unshift(time)
    displayed.unshift(`🏳️ Durée par défaut (30 minutes) (end: ${time})`)
  }

  const answer = await openSuggester(app, {
    displayedValues: displayed,
    usedValues: used,
    title: `Quelle durée ?`,
    description: `Heure de début ${task.start}`
  }) || undefined;

  task.end = answer === "Personnalize"
  ? await openHourModal(app, 'Renseignez une heure') || undefined
  : answer
}