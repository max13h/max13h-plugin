import { App } from "obsidian";
import { openSuggester } from "src/modal/suggesterModal";
import { TaskObject } from "../formatTaskObject";

export const askTaskGroup = async (app: App, taskGroup: TaskObject[]) => {
  return await openSuggester(app, {
    displayedValues: [...taskGroup.map(task => task.text || '')],
    usedValues: [...taskGroup],
    title: 'Quelle tâche spécifique ?'
  });
}