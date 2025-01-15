import { App } from "obsidian";
import { openSuggester } from "src/modal/suggesterModal";
import { TaskObject } from "../formatTaskObject";

export const askAdjustRecentTaskEndTime = async (app: App, task: TaskObject, recentTask: TaskObject, newTime: string) => {
  return await openSuggester(app, {
    displayedValues: ['🟩 Oui', '🟥 Non'],
    usedValues: [true, false],
    title: `Raccorder la fin de la tâche la plus récente ? (De ${recentTask.end} à ${newTime})`
  });
}