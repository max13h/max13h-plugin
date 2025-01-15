import { App, moment } from "obsidian";
import { adjustRecentTaskEndTime } from "src/utils/tasks/adjustRecentTaskEndTime";
import { askChooseRecentTask } from "src/utils/tasks/ask/askChooseRecentTask";
import { askDate } from "src/utils/tasks/ask/askDate";
import { askDuration } from "src/utils/tasks/ask/askDuration";
import { askStart } from "src/utils/tasks/ask/askStart";
import { formatTaskObject, testTaskObject } from "src/utils/tasks/formatTaskObject";
import { formatTaskString } from "src/utils/tasks/formatTaskString";
import { getTasksFromDate } from "src/utils/tasks/getTasksFromDate";
import { RecentTaskChoosen, sortTasksByClosenessToNow, TasksByClosenessToNow } from "src/utils/tasks/sortTasksByClosenessToNow";
import { dateWithEmoji, timeFromTask } from "src/utils/time";
import { timeNow } from "src/utils/time";

const getCursor = (activeLeaf: any) => {
  // @ts-ignore
  const editor = activeLeaf.view.editor
  const cursor = editor.getCursor() // {line: 56, ch: 40}
  if (!cursor) {
    throw new Error("Cursor not found");
  }
  return cursor;
}

export const updateTaskTime = async (app: App) => {
  const now = timeNow()
  const today = dateWithEmoji("today")

  const activeLeaf = app.workspace.getLeaf(false);
  const { view } = activeLeaf
  // @ts-ignore
  const { editor } = view
  const cursor = getCursor(activeLeaf);
  const lineContent = editor.getLine(cursor.line) as string
  //@ts-ignore
  const task = formatTaskObject(lineContent, {metadata: {path: view.path, line: cursor.line}})

  const tasksFromToday = getTasksFromDate(app, today.slice(2))
  const tasksByClosenessToNow = sortTasksByClosenessToNow(tasksFromToday)
  let recentTaskChoosen: RecentTaskChoosen = { value: null }

  if (!task.emojiProperties?.scheduled) {
    if (!task.emojiProperties) task.emojiProperties = {}
    await askDate(app, task, today)
  }

  await askStart(app, task, tasksByClosenessToNow, recentTaskChoosen, today, now, true)
  await askDuration(app, task, 0, now, true)
  testTaskObject(task)

  // ask doWeAdjustRecentTaskEndTime
  const momentScheduledDate = moment(task.emojiProperties.scheduled?.slice(2), 'YYYY-MM-DD');
  const isScheduledDateIsFormatedAndToday = momentScheduledDate.isValid() && (momentScheduledDate.format('YYYY-MM-DD') == today.slice(2))
  const recentTaskNewEndTime = timeFromTask(task, "before", "start")
  const isDifferentEndTime = recentTaskNewEndTime !== recentTaskChoosen.value?.end

  if (isScheduledDateIsFormatedAndToday && recentTaskNewEndTime && tasksByClosenessToNow && ((tasksByClosenessToNow?.timeSorted.length || 0) > 0) && isDifferentEndTime) {
    if (!recentTaskChoosen.value) recentTaskChoosen.value = await askChooseRecentTask(app, task, tasksByClosenessToNow, true, now, "Choisir la tâche récente à raccorder au début de la nouvelle")

    if (recentTaskChoosen.value) await adjustRecentTaskEndTime(app, recentTaskChoosen.value, recentTaskNewEndTime)
  }
  //==

  const lineNewContent = formatTaskString(task)

  editor.setLine(cursor.line, lineNewContent)
  editor.setCursor({ line: cursor.line, ch: lineNewContent.length })
}