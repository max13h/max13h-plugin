import { App, moment } from "obsidian";
import { timeNow, dateWithEmoji, timeFromTask } from "src/utils/time";
import { openOrCreateFile } from "src/utils/openOrCreateFile";
import { delay } from "src/utils/delay";
import { TaskObject, testTaskObject } from "src/utils/tasks/formatTaskObject";
import { formatTaskString } from "src/utils/tasks/formatTaskString";
import { openSuggester } from "src/modal/suggesterModal";
import { getTasksFromDate } from "src/utils/tasks/getTasksFromDate";
import { sortTasksByClosenessToNow } from "src/utils/tasks/sortTasksByClosenessToNow";
import { askStart } from "src/utils/tasks/ask/askStart";
import { askTaskText } from "src/utils/tasks/ask/askTaskText";
import { askDuration } from "src/utils/tasks/ask/askDuration";
import { askAdjustRecentTaskEndTime } from "src/utils/tasks/ask/askAdjustRecentTaskEndTime";
import { askTaskGroup } from "src/utils/tasks/ask/askTaskGroup";
import { askPath } from "src/utils/tasks/ask/askPath";
import { askDate } from "src/utils/tasks/ask/askDate";
import { askNewTask } from "src/utils/tasks/ask/askNewTask";

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
const adjustMostRecentTaskEndTime = async (app: App, task: TaskObject, mostRecentTask: TaskObject, newTime: string) => {
  const filePath = mostRecentTask.metadata.path
  if (!filePath) throw new Error("Most recent task has no file path");
  
  mostRecentTask.end = newTime

  const activeLeaf = await openOrCreateFile(app, filePath, "source");
  // @ts-ignore
  const editor = activeLeaf.view.editor;
  editor.setLine(mostRecentTask.metadata.line, formatTaskString(mostRecentTask))
}

export const addTask = async (app: App) => {
  const now = timeNow()
  const today = dateWithEmoji('today')

  const newTask = await askNewTask(app);
  if (!newTask) return;

  if (newTask.name === "🌙 Sommeil" && newTask.tasks) {
    newTask.tasks.forEach(async (task) => {
      const newLine = formatTaskString(task);
      await addTaskToFileFromPath(app, task.metadata?.path, newLine)
      await delay(1000)

      return
    })
    return
  }

    // Task
  let task = newTask.tasks?.length ? await askTaskGroup(app, newTask.tasks) : newTask.task
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
  let recentTaskChoosen
  const defaultTaskDuration = task.start && task.end ? moment(task.end, 'HH:mm').diff(moment(task.start, 'HH:mm'), 'minutes') : 0;

  await askStart(app, task, ((tasksByClosenessToNow?.timeSorted.length || 0) > 0), today, now)
  if (!task.start) return

  if (task.start !== 'No start') {
    if (task.start === 'Recent task' && tasksByClosenessToNow?.timeSorted) {
      recentTaskChoosen = await openSuggester(app, {
        displayedValues: tasksByClosenessToNow.timeSorted.map(taskInFile => {
          const timeDiff = moment(taskInFile.end, 'HH:mm').diff(moment(), 'minutes');
          const hours = Math.floor(Math.abs(timeDiff) / 60);
          const minutes = Math.abs(timeDiff) % 60;
          const diffString = (timeDiff > 0 
            ? 'Dans '
            : 'Il y a ')
              + (hours > 0 ? hours + 'h ' : '') + minutes + 'm';
          return `${taskInFile.start} - ${taskInFile.end} ${taskInFile.text?.slice(0, 5)} (${diffString})`
        }),
        usedValues: tasksByClosenessToNow.timeSorted,
        title: `Choisir la tâche récente référente`,
        description: `Heure actuelle: ${now}`
      })

      task.start = timeFromTask(recentTaskChoosen, "after", "end")
    }
    testTaskObject(task)

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

  const newTime = timeFromTask(task, "before", "start")
  if (newTime && newTime !== recentTaskChoosen?.end) {
    const doWeAdjustRecentTaskEndTime = (isScheduledDateIsFormatedAndToday && !!recentTaskChoosen) 
    ? await askAdjustRecentTaskEndTime(app, task, recentTaskChoosen, newTime)
    : false;
    // AJUSTER LA TACHE RECENTE 

  if (doWeAdjustRecentTaskEndTime && recentTaskChoosen) adjustMostRecentTaskEndTime(app, task, recentTaskChoosen, newTime)
  }

  // ===

  const newLine = formatTaskString(task);
  await addTaskToFileFromPath(app, task.metadata.path, newLine)
}
