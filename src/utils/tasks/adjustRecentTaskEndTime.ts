import { App } from "obsidian";
import { TaskObject } from "./formatTaskObject";
import { openOrCreateFile } from "../openOrCreateFile";
import { formatTaskString } from "./formatTaskString";

export const adjustRecentTaskEndTime = async (app: App, mostRecentTask: TaskObject, newTime: string) => {
  const filePath = mostRecentTask.metadata.path
  if (!filePath) throw new Error("Most recent task has no file path");
  
  mostRecentTask.end = newTime

  const activeLeaf = await openOrCreateFile(app, filePath, "source");
  // @ts-ignore
  const editor = activeLeaf.view.editor;
  editor.setLine(mostRecentTask.metadata.line, formatTaskString(mostRecentTask))
}