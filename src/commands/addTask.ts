import { App, moment } from "obsidian";
import { timeNow, dateWithEmoji, durationFromStartTime, getNextDayDate, timeFromTask } from "src/utils/time";
import { RecurringTask, recurringTasks } from "src/assets/recurringTasks";
import { openOrCreateFile } from "src/utils/openOrCreateFile";
import { delay } from "src/utils/delay";
import { TaskObject, testTaskObject } from "src/utils/tasks/formatTaskObject";
import { formatTaskString } from "src/utils/tasks/formatTaskString";
import { retrieveFilesFromTags } from "src/utils/retriveFilesFromTags";
import { openSuggester } from "src/modal/suggesterModal";
import { openDateModal } from "src/modal/dateModal";
import { openHourModal } from "src/modal/hourModal";
import { getTasksFromDate } from "src/utils/tasks/getTasksFromDate";
import { sortTasksByClosenessToNow } from "src/utils/tasks/sortTasksByClosenessToNow";

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
const askNewTask = async (app: App): Promise<RecurringTask | null> => {
  const recurringTasksWithNew: RecurringTask[] = [
    {name: '🆕 Nouvelle tâche', task: {metadata: {}}}, 
    ...recurringTasks()
  ]

  return await openSuggester(app, {
    displayedValues: [...recurringTasksWithNew.map(task => task.name)],
    usedValues: [...recurringTasksWithNew],
    title: 'Quelle tâche ?'
  });
}
const askPath = async (app: App, task: TaskObject) => {
  if (task.metadata.path) return

  const filesWithTag = retrieveFilesFromTags(app, ["projet/en-cours"], undefined, "To-do"); 
  task.metadata.path = await openSuggester(app, {
    displayedValues: filesWithTag.map(file => file.basename).sort(),
    usedValues: filesWithTag.map(file => file.path).sort(),
    title: 'Quel projet ?'
  }) || '';
}
const askTaskGroup = async (app: App, taskGroup: TaskObject[]) => {
  return await openSuggester(app, {
    displayedValues: [...taskGroup.map(task => task.text || '')],
    usedValues: [...taskGroup],
    title: 'Quelle tâche spécifique ?'
  });
}
const askDate = async (app: App, task: TaskObject, today: string) => {
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
const askStart = async (app: App, task: TaskObject, hasRecentTask: boolean, today: string, now: string): Promise<string | undefined> => {
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
  } else {
    return task.start = answer?.toString()
  }
}
const askAdjustRecentTaskEndTime = async (app: App, task: TaskObject, recentTask: TaskObject, newTime: string) => {
  return await openSuggester(app, {
    displayedValues: ['🟩 Oui', '🟥 Non'],
    usedValues: [true, false],
    title: `Raccorder la fin de la tâche la plus récente ? (De ${recentTask.end} à ${newTime})`
  });
}
const askDuration = async (app: App, task: TaskObject, defaultTaskDuration: number, now: string) => {
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
const askTaskText = async (app: App) => {
  // @ts-ignore
  const qa = app.plugins.plugins.quickadd.api
  return await qa.inputPrompt("Tâche à ajouter ☑️", "")
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
    
    if (doWeAdjustRecentTaskEndTime && recentTaskChoosen) adjustMostRecentTaskEndTime(app, task, recentTaskChoosen, newTime)
    }

  // ===

  const newLine = formatTaskString(task);
  await addTaskToFileFromPath(app, task.metadata.path, newLine)
}
