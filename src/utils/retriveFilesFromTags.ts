import { App, TFile } from "obsidian";

export const retrieveFilesFromTags = (app: App, tagsIncluded: string[], tagsExcluded?: string[], heading?: string) => {
  const files = app.vault.getMarkdownFiles();
  const filesWithTag: TFile[] = [];

  files.forEach((file) => {
    const fileCache = app.metadataCache.getFileCache(file);
    const tags = fileCache?.frontmatter?.tags;
    const headings = fileCache?.headings;

    if (tags && Array.isArray(tags)) {
        const includesRequiredTags = tagsIncluded.every(tag => tags.includes(tag));
        const excludesForbiddenTags = tagsExcluded?.every(tag => !tags.includes(tag)) || [];
        const hasHeading = !heading || headings?.some(h => h.heading === heading);

        if (includesRequiredTags && excludesForbiddenTags && hasHeading) {
            filesWithTag.push(file);
        } else if (includesRequiredTags && excludesForbiddenTags && !hasHeading) {
            console.warn(`File "${file.path}" matches tags but is missing heading "${heading}"`);
        }
    }
  });
  return filesWithTag.sort((a, b) => a.basename.localeCompare(b.basename));
};