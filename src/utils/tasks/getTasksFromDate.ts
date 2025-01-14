import { App, moment } from "obsidian";
import { formatTaskObject, TaskObject } from "./formatTaskObject";

export const getTasksFromDate = (app: App, date: string) => {
  const momentDate = moment(date, "YYYY-MM-DD")
  if (!momentDate.isValid()) throw new Error("Daate not valid")

  // @ts-ignore
  const dv = app.plugins.plugins.dataview.api;

  const tasksFromDate: TaskObject[] = []

  const pagePaths = dv.pagePaths();
  pagePaths.forEach((path: string) => dv.page(path).file.tasks.forEach((task: any) => {
    const taskObject = formatTaskObject(task.text, {status: task.status, metadata: {path: task.link.path, line: task.line, startCh: task.position.start.col, endCh: task.position.end.col}}) 

    const taskDate = moment(taskObject.emojiProperties?.scheduled?.slice(2), "YYYY-MM-DD")

    if (taskDate.isValid() && (taskDate.format("YYYY-MM-DD") === date)) tasksFromDate.push(taskObject);
  }))

  return tasksFromDate
};