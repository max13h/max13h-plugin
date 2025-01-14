// import { App, Notice } from "obsidian";
// import { formatTaskObject } from "src/utils/tasks/formatTaskObject";
// import { isTask } from "src/utils/tasks/isTask";
// import { timeFromMostRecentTask } from "src/utils/tasks/retrieveMostRecentTask";
// import { timeBeforeFromNow, timeLaterFromNow, timeNow } from "src/utils/time";

// const getCursor = (app: App, activeLeaf: any) => {
//   // @ts-ignore
//   const editor = activeLeaf.view.editor
//   const cursor = editor.getCursor() // {line: 56, ch: 40}
//   if (!cursor) {
//     throw new Error("Cursor not found");
//   }
//   return cursor;
// }

// const askStartOrEnd = async (app: App) => {
//   // @ts-ignore
//   const qa = app.plugins.plugins.quickadd.api 
//   return await qa.suggester([
//     'Modifier le début 🟢',
//     'Modifier la fin 🔴',
//   ], [
//     'start',
//     'end'
//   ]);
// }
// const askFirstTime = async (app: App, startOrEnd: 'start' | 'end') => {
//   // @ts-ignore
//   const qa = app.plugins.plugins.quickadd.api 

//   const startOptionsValues = [
//     [
//       "Commencer la tâche maintenant ⚡",
//       "À la suite de la tâche précédente la plus récente 🩹",
//       "🕔 Dans 5 minutes",
//       "⌛ Il y a 5 minutes",
//       "🕔 Dans 10 minutes",
//       "⌛ Il y a 10 minutes",
//       "🕔 Dans 15 minutes",
//       "⌛ Il y a 15 minutes",
//       "🕔 Dans 20 minutes",
//       "⌛ Il y a 20 minutes",
//       "🕔 Dans 25 minutes",
//       "⌛ Il y a 25 minutes",
//       "🕔 Dans 30 minutes",
//       "⌛ Il y a 30 minutes",
//       "🕔 Dans 45 minutes",
//       "⌛ Il y a 45 minutes",
//       "🕔 Dans 60 minutes",
//       "⌛ Il y a 60 minutes",
//     ],
//     [
//       timeNow(),
//       timeFromMostRecentTask(app, 'past'),
//       timeLaterFromNow(5),
//       timeBeforeFromNow(5),
//       timeLaterFromNow(10),
//       timeBeforeFromNow(10),
//       timeLaterFromNow(15),
//       timeBeforeFromNow(15),
//       timeLaterFromNow(20),
//       timeBeforeFromNow(20),
//       timeLaterFromNow(25),
//       timeBeforeFromNow(25),
//       timeLaterFromNow(30),
//       timeBeforeFromNow(30),
//       timeLaterFromNow(45),
//       timeBeforeFromNow(45),
//       timeLaterFromNow(60),
//       timeBeforeFromNow(60),
//     ]
//   ]

//   const endOptionsValues = [
//     [
//       "Finir la tâche maintenant ⚡",
//       "Avant la tâche à venir la plus récente 🩹",
//       "🕔 Dans 5 minutes",
//       "⌛ Il y a 5 minutes",
//       "🕔 Dans 10 minutes",
//       "⌛ Il y a 10 minutes",
//       "🕔 Dans 15 minutes",
//       "⌛ Il y a 15 minutes",
//       "🕔 Dans 20 minutes",
//       "⌛ Il y a 20 minutes",
//       "🕔 Dans 25 minutes",
//       "⌛ Il y a 25 minutes",
//       "🕔 Dans 30 minutes",
//       "⌛ Il y a 30 minutes",
//       "🕔 Dans 45 minutes",
//       "⌛ Il y a 45 minutes",
//       "🕔 Dans 60 minutes",
//       "⌛ Il y a 60 minutes",
//     ],
//     [
//       timeNow(),
//       timeFromMostRecentTask(app, 'future'),
//       timeLaterFromNow(5),
//       timeBeforeFromNow(5),
//       timeLaterFromNow(10),
//       timeBeforeFromNow(10),
//       timeLaterFromNow(15),
//       timeBeforeFromNow(15),
//       timeLaterFromNow(20),
//       timeBeforeFromNow(20),
//       timeLaterFromNow(25),
//       timeBeforeFromNow(25),
//       timeLaterFromNow(30),
//       timeBeforeFromNow(30),
//       timeLaterFromNow(45),
//       timeBeforeFromNow(45),
//       timeLaterFromNow(60),
//       timeBeforeFromNow(60),
//     ]
//   ]
//   return await qa.suggester(startOrEnd === "start" ? startOptionsValues : endOptionsValues)
// }
// const askSecondTime = async (app: App, startOrEnd: 'start' | 'end') => {
//   // @ts-ignore
//   const qa = app.plugins.plugins.quickadd.api 

//   const startOptionsValues = [
//     [
//       "À la suite de la tâche précédente la plus récente 🩹",
//       "⌛ Il y a 5 minutes",
//       "⌛ Il y a 10 minutes",
//       "⌛ Il y a 15 minutes",
//       "⌛ Il y a 20 minutes",
//       "⌛ Il y a 25 minutes",
//       "⌛ Il y a 30 minutes",
//       "⌛ Il y a 45 minutes",
//       "⌛ Il y a 60 minutes",
//     ],
//     [
//       timeFromMostRecentTask(app, 'past'),
//       timeBeforeFromNow(5),
//       timeBeforeFromNow(10),
//       timeBeforeFromNow(15),
//       timeBeforeFromNow(20),
//       timeBeforeFromNow(25),
//       timeBeforeFromNow(30),
//       timeBeforeFromNow(45),
//       timeBeforeFromNow(60),
//     ]
//   ]

//   const endOptionsValues = [
//     [
//       "Avant la tâche à venir la plus récente 🩹",
//       "🕔 Dans 5 minutes",
//       "🕔 Dans 10 minutes",
//       "🕔 Dans 15 minutes",
//       "🕔 Dans 20 minutes",
//       "🕔 Dans 25 minutes",
//       "🕔 Dans 30 minutes",
//       "🕔 Dans 45 minutes",
//       "🕔 Dans 60 minutes",
//     ],
//     [
//       timeFromMostRecentTask(app, 'future'),
//       timeLaterFromNow(5),
//       timeLaterFromNow(10),
//       timeLaterFromNow(15),
//       timeLaterFromNow(20),
//       timeLaterFromNow(25),
//       timeLaterFromNow(30),
//       timeLaterFromNow(45),
//       timeLaterFromNow(60),
//     ]
//   ]
//   return await qa.suggester(startOrEnd === "start" ? startOptionsValues : endOptionsValues)
// }

// export const updateTaskTime = async (app: App) => {
//   /*
//   - lancer la modal
//     - Update start
//       - if no start
//         - if en throw error
//         - modal start time (la meme que celle de add task en ajoutant "ne pas définir")
//         - if no end time
//           - modal end time 1.Defaut (20 minutes), ...
//         - else 
//           - modal end time (la meme que celle de add task en ajoutant "ne pas définir")
//     - Update end
//       - if no end
//         - if start throw error
//         - modal end time (la meme que celle de add task en ajoutant "ne pas définir")
//   */
//   const activeLeaf = app.workspace.getLeaf(false);
//   const cursor = getCursor(app, activeLeaf);

//   // @ts-ignore
//   const line = activeLeaf.view.editor.getLine(cursor.line) as string
//   if (!isTask(line)) {
//     new Notice("Task not found");
//     return
//   };

//   const taskObject = formatTaskObject(line, true);
  
//   const startOrEnd = await askStartOrEnd(app);
//   if (!startOrEnd) return;
  
//   if (!taskObject.start && taskObject.end) throw new Error("Task has no start time but a end time");
//   if (taskObject.start && !taskObject.end) throw new Error("Task has no end time but a start time");

//   if (startOrEnd === 'start') {
//     taskObject.start = await askFirstTime(app, 'start');
//     taskObject.end = await askSecondTime(app, 'end');
//   } else if (startOrEnd === 'end') {
//     taskObject.start = await askFirstTime(app, 'end');
//     taskObject.end = await askSecondTime(app, 'start');
//   }

//   // const taskObject = formatTaskObject(line, true);

//   // if (!taskObject.start || !taskObject.end) {
    
//   // }
//   // const taskPattern = /^- \[([ x\/])\] (.+)$/
//   // const timePattern = /^(\d{1,2}:\d{2}\s*-\s*(?:\d{1,2}:\d{2})?)(.*)/

//   // const taskMatch = line.match(taskPattern);
//   // if (!taskMatch) {
//   //   throw new Error("Invalid task format");
//   // }
//   // const [_1, state, initialText] = taskMatch;

//   // let updatedText;

//   // const timeMatch = initialText.match(timePattern);
//   // if (!timeMatch) {
//   //   updatedText = `- [${state}] ${timeNow()} - ${timeLater(20)} ${initialText.trim()}`;
//   // } else {
//   //   const [_2, time, taskText] = timeMatch;
//   //   const [_startTime = '', endTime = ''] = time.split('-').map(t => t.trim());
//   //   updatedText = `- [${state}] ${timeNow()} - ${endTime || timeLater(20)} ${taskText.trim()}`;
//   // }
  
//   // editor.setLine(cursor.line, updatedText)
//   // editor.setCursor({ line: cursor.line, ch: updatedText.length })
// }