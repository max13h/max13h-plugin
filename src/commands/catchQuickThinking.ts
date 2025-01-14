import { Max13hPluginSettings } from "main";
import { App, moment } from "obsidian";
import { openOrCreateFile } from "src/utils/openOrCreateFile";

export const catchQuickThinking = async (app: App, settings: Max13hPluginSettings) => {
  // @ts-ignore
  const qa = app.plugins.plugins.quickadd.api

  // const text = await qa.wideInputPrompt("Saisissez votre pensée")

  const year = moment().format("YYYY")
  const month = moment().format("MM")
  const week = moment().format('WW')
  const today = moment().format("YYYY-MM-DD")
  const dailyPath = `daily/${year}/${month}/${week}/${today}.md`
  
  const activeLeaf = await openOrCreateFile(app, dailyPath, "source", settings.dailyNoteTemplatePath)
  // @ts-ignore
  const editor = activeLeaf.view.editor
  // @ts-ignore
  const content = activeLeaf.view.data.split("\n")
  const lastLine = content.length
  const lastLineContentUpdated = editor.getLine(lastLine) + " \n"
  editor.setLine(lastLine, lastLineContentUpdated )
  editor.setCursor(lastLine + 1)

}