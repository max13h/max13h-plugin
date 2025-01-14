import { App } from 'obsidian';
import type { TFile } from 'obsidian';

const openFile = async (app: App, filePath: TFile) => {
  const activeLeaf = app.workspace.getLeaf() || app.workspace.getLeaf('tab')
  await activeLeaf.openFile(filePath);

  const view = activeLeaf.getViewState();
  if (!view || !view.state) throw new Error("View not found");
  view.state.mode = 'source';
  activeLeaf.setViewState(view);
  // Give focus to the new leaf
  app.workspace.setActiveLeaf(activeLeaf, { focus: true });

  if (!activeLeaf || !activeLeaf.view || activeLeaf.view.getViewType() !== 'markdown') {
      throw new Error("Active view is not a Markdown file");
  } else {
    return activeLeaf
  }
}

export const openOrCreateFileInSourceMode = async (app: App, path: string, templatePath?: string) => {
  // Get the index of the last slash in the path
  const lastSlashIndex = path.lastIndexOf('/');
  
  // If there is a slash, extract the folder path; otherwise, set it to an empty string
  const folderPath = lastSlashIndex !== -1 ? path.slice(0, lastSlashIndex) : '';
  
  // If there is a slash, extract the file name; otherwise, use the entire path
  // Remove the '.md' extension from the file name
  const fileName = lastSlashIndex !== -1 ? path.slice(lastSlashIndex + 1).replace('.md', '') : path.replace('.md', '');

  if (folderPath.endsWith('/')) {
    throw new Error("Folder path must not end with a '/'");
  }
  if (fileName.startsWith('/')) {
    throw new Error("Filename must not start with a '/'");
  }
  
  const formattedFilePath = `${folderPath}${folderPath ? '/' : ''}${fileName}.md`
  const existingFile = app.vault.getAbstractFileByPath(formattedFilePath);
  const existingFolder = folderPath ? app.vault.getAbstractFileByPath(folderPath) : true ;

  if (existingFile) {
    return openFile(app, existingFile as TFile)
  } else {
    if (!existingFolder) await app.vault.createFolder(folderPath);

    let templateFile;
    if (templatePath) {
      const formatedTemplatePath = templatePath.endsWith('.md') ? templatePath : templatePath + '.md'
      templateFile = app.vault.getAbstractFileByPath(formatedTemplatePath)
      if (!templateFile) {
          throw new Error('Template file not found');
      }
    }
    const content = templateFile ? await app.vault.read(templateFile as any) : ''
    const newFile = await app.vault.create(formattedFilePath, content);
    return openFile(app, newFile as TFile)
  }
}