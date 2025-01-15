import { App } from "obsidian"

export const askTaskText = async (app: App) => {
  // @ts-ignore
  const qa = app.plugins.plugins.quickadd.api
  return await qa.inputPrompt("Tâche à ajouter ☑️", "")
}