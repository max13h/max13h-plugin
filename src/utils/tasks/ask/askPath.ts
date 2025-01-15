import { App } from "obsidian";
import { openSuggester } from "src/modal/suggesterModal";
import { retrieveFilesFromTags } from "src/utils/retriveFilesFromTags";
import { TaskObject } from "../formatTaskObject";

export const askPath = async (app: App, task: TaskObject) => {
  if (task.metadata.path) return

  const filesWithTag = retrieveFilesFromTags(app, ["projet/en-cours"], undefined, "To-do"); 
  task.metadata.path = await openSuggester(app, {
    displayedValues: filesWithTag.map(file => file.basename).sort(),
    usedValues: filesWithTag.map(file => file.path).sort(),
    title: 'Quel projet ?'
  }) || '';
}