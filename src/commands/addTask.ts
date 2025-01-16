import { App, moment } from "obsidian";
import { timeNow, dateWithEmoji, timeFromTask } from "src/utils/time";
import { openOrCreateFile } from "src/utils/openOrCreateFile";
import { delay } from "src/utils/delay";
import { testTaskObject } from "src/utils/tasks/formatTaskObject";
import { formatTaskString } from "src/utils/tasks/formatTaskString";
import { getTasksFromDate } from "src/utils/tasks/getTasksFromDate";
import { RecentTaskChoosen, sortTasksByClosenessToNow } from "src/utils/tasks/sortTasksByClosenessToNow";
import { askStart } from "src/utils/tasks/ask/askStart";
import { askTaskText } from "src/utils/tasks/ask/askTaskText";
import { askDuration } from "src/utils/tasks/ask/askDuration";
import { askTaskGroup } from "src/utils/tasks/ask/askTaskGroup";
import { askPath } from "src/utils/tasks/ask/askPath";
import { askDate } from "src/utils/tasks/ask/askDate";
import { askNewTask } from "src/utils/tasks/ask/askNewTask";
import { askChooseRecentTask } from "src/utils/tasks/ask/askChooseRecentTask";
import { adjustRecentTaskEndTime } from "src/utils/tasks/adjustRecentTaskEndTime";

const writeNewTaskInFile = async (activeLeaf: any, newLineContent: string) => {
  const editor = activeLeaf.view.editor;
  // Retrieve the current document content
  const content = editor.getValue();
  const heading = "To-do";
  const headingRegex = new RegExp(`^#{1,6} ${heading}\\b`, 'm'); // Match the "To-do" heading

  // Find the position of the "To-do" heading
  const match = content.match(headingRegex);
  if (match) {
      const startPos = content.indexOf(match[0]);

      // Determine the line number of the match
      const startLine = content.substring(0, startPos).split('\n').length - 1;
      // Insert a new task line after the heading
      editor.replaceRange(`\n${newLineContent}`, { line: startLine, ch: 7 });
      // Place the cursor at the end of the new task line
      editor.setCursor({ line: startLine + 1, ch: newLineContent.length })
      await delay(300)
      editor.focus()
  } else {
    throw new Error(`Heading "${heading}" not found.`);
  }
}
const addTaskToFileFromPath = async (app: App, filePath: string | undefined | null, newLineContent: string | undefined | null) => {
  if (!filePath) throw new Error("No file path given");
  if (!newLineContent) throw new Error("No task text given");

  const activeLeaf = await openOrCreateFile(app, filePath, "source");
  await delay(100)
  await writeNewTaskInFile(activeLeaf, newLineContent);
}

export const addTask = async (app: App) => {
  const now = timeNow()
  const today = dateWithEmoji('today')

  const newTask = await askNewTask(app);

  if (newTask && newTask.name === "🌙 Sommeil" && newTask.tasks) {
    newTask.tasks.forEach(async (el) => {
      if (!el.task) return
      const newLine = formatTaskString(el.task);
      await addTaskToFileFromPath(app, el.task.metadata?.path, newLine)
      await delay(100)
      return
    })
    return
  }
  if (!newTask || !newTask.task) return;

    // Task
  let task = newTask.task
  if (!task) return;

  // Path
  await askPath(app, task)
  if (!task.metadata.path) return;

  // Status
  task.status = " ";

  await askDate(app, task, today)
  if (!task.emojiProperties?.scheduled) return;
  task.emojiProperties.scheduled = task.emojiProperties.scheduled === 'No date' ? undefined : task.emojiProperties.scheduled
  testTaskObject(task)

  const tasksFromToday = getTasksFromDate(app, today.slice(2))
  const tasksByClosenessToNow = tasksFromToday.length ? sortTasksByClosenessToNow(tasksFromToday) : null
  const recentTaskChoosen: RecentTaskChoosen = { value: null }
  const defaultTaskDuration = task.start && task.end ? moment(task.end, 'HH:mm').diff(moment(task.start, 'HH:mm'), 'minutes') : 0;

  await askStart(app, task, tasksByClosenessToNow, recentTaskChoosen, today, now)
  if (!task.start) return

  if (task.start !== 'No start') {

    await askDuration(app, task, defaultTaskDuration, now);
    if (!task.end) return;
    testTaskObject(task)
  } else {
    task.start = undefined
    task.end = undefined
  }
  testTaskObject(task)

  if (!task.text) task.text = await askTaskText(app);
  if (!task.text) return;

  testTaskObject(task)

  // ask doWeAdjustRecentTaskEndTime
  const momentScheduledDate = moment(task.emojiProperties.scheduled?.slice(2), 'YYYY-MM-DD');
  const isScheduledDateIsFormatedAndToday = momentScheduledDate.isValid() && (momentScheduledDate.format('YYYY-MM-DD') == today.slice(2))
  const recentTaskNewEndTime = timeFromTask(task, "before", "start")
  const isDifferentEndTime = recentTaskNewEndTime !== recentTaskChoosen.value?.end

  if (isScheduledDateIsFormatedAndToday && recentTaskNewEndTime && tasksByClosenessToNow && ((tasksByClosenessToNow?.timeSorted.length || 0) > 0) && isDifferentEndTime) {
    if (!recentTaskChoosen.value) recentTaskChoosen.value = await askChooseRecentTask(app, task, tasksByClosenessToNow, true, now, "Choisir la tâche récente à raccorder au début de la nouvelle")

    if (recentTaskChoosen.value) {
      await adjustRecentTaskEndTime(app, recentTaskChoosen.value, recentTaskNewEndTime)
      await delay(200)
    }
  }
  // ===

  const newLine = formatTaskString(task);
  await addTaskToFileFromPath(app, task.metadata.path, newLine)
}
