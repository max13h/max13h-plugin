import { App, moment } from "obsidian";
import { openSuggester } from "src/modal/suggesterModal";
import { TasksByClosenessToNow } from "../sortTasksByClosenessToNow";
import { TaskObject } from "../formatTaskObject";

export const askChooseRecentTask = async (app: App, task: TaskObject, tasksByClosenessToNow: TasksByClosenessToNow, isOptional = true, now: string, title: string = 'Choisir la tâche récente référente') => {
  if (tasksByClosenessToNow.timeSorted.length === 0) return null

  const tasksByClosenessToNowWithoutActualTask = tasksByClosenessToNow.timeSorted.filter((recentTask) => {
    const isSameTask = recentTask.metadata.line === task.metadata.line 
      && recentTask.metadata.path === task.metadata.path 
      && recentTask.text === task.text

    return !isSameTask
  })

  console.log('tasksByClosenessToNowWithoutActualTask', tasksByClosenessToNowWithoutActualTask);

  const displayed: string[] = [...tasksByClosenessToNowWithoutActualTask.map(taskInFile => {
    const timeDiff = moment(taskInFile.end, 'HH:mm').diff(moment(), 'minutes');
    const hours = Math.floor(Math.abs(timeDiff) / 60);
    const minutes = Math.abs(timeDiff) % 60;
    const diffString = (timeDiff > 0 
      ? 'Dans '
      : 'Il y a ')
        + (hours > 0 ? hours + 'h ' : '') + minutes + 'm';
    return `${taskInFile.start} - ${taskInFile.end} ${taskInFile.text?.slice(0, 15)}... (${diffString})`
  })]
  const used: (TaskObject | null)[] = [...tasksByClosenessToNowWithoutActualTask]

  if (isOptional) {
    displayed.unshift("🔴 Ne pas choisir de tâche")
    used.unshift(null)
  }

  return await openSuggester(app, {
    displayedValues: displayed,
    usedValues: used,
    title: title,
    description: `Heure actuelle: ${now}`
  })
} 