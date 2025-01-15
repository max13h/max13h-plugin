import { moment } from "obsidian";
import { TaskObject } from "./formatTaskObject";

export interface TasksByClosenessToNow {
  timeSorted: TaskObject[];
  withoutTime: TaskObject[];
}

export interface RecentTaskChoosen { 
  value: TaskObject | null
}

export const sortTasksByClosenessToNow = (tasksFromDate: TaskObject[]): TasksByClosenessToNow | null => {
  const now = moment();

  if (!tasksFromDate.length) return null

  const tasksWithoutTime = tasksFromDate.filter(task => !task.start || !task.end)
  const tasksWithTimeSorted = tasksFromDate.filter(task => task.start && task.end)
  .sort((a, b) => {
    const startA = moment(a.start, "HH:mm")
    const startB = moment(b.start, "HH:mm")
    const endA = moment(a.end, "HH:mm")
    const endB = moment(b.end, "HH:mm")

    // Handle undefined `end`
    if (!endA && !endB) return 0;
    if (!endA || startA?.isAfter(now)) return 1; // Positive donc B passe avant
    if (!endB || startB?.isAfter(now)) return -1; // Négatif donc A passe avant

    // Calculate differences from now
    const diffA = endA.diff(now);
    const diffB = endB.diff(now);

    // Sort by proximity, prioritizing times before now
    if (diffA >= 0 && diffB >= 0) {
      // Both are in the future
      return Math.abs(diffA) - Math.abs(diffB);
    } else if (diffA < 0 && diffB < 0) {
      // Both are in the past
      return Math.abs(diffA) - Math.abs(diffB);
    } else if (diffA < 0 && diffB >= 0) {
      // `endA` is in the past, `endB` in the future
      return -1;
    } else {
      // `endB` is in the past, `endA` in the future
      return 1;
    }
  })

  if (tasksFromDate.length !== [...tasksWithTimeSorted, ...tasksWithoutTime].length) throw new Error("Arrays before and after lost elements");

  return {
    timeSorted: tasksWithTimeSorted,
    withoutTime: tasksWithoutTime
  }
}