import { App } from 'obsidian';
import { openOrCreateFileInSourceMode } from '../utils/openOrCreateFileInSourceMode';
import { Max13hPluginSettings } from 'main';

export const createProject = async (app: App, settings: Max13hPluginSettings) => {
  // @ts-ignore
  const qa = app.plugins.plugins.quickadd.api

  const name = await qa.inputPrompt("Nom du projet", "")
  if (!name) return

  const path = settings.binFolder + '/' + name

  await openOrCreateFileInSourceMode(app, path, settings.projectTemplatePath)
}
