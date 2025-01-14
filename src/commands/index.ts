import { App, Editor, MarkdownFileInfo, MarkdownView, Notice, View } from 'obsidian';
import { moveFileToBin } from './moveFileToBin';
import { createProject } from './createProject';
import { addTask } from './addTask';
import type Max13hPlugin from 'main';
import { getTasksFromDate } from 'src/utils/tasks/getTasksFromDate';

export class Commands {
    private readonly plugin: Max13hPlugin;

    private get app(): App {
        return this.plugin.app;
    }

    constructor({ plugin }: { plugin: Max13hPlugin }) {
      this.plugin = plugin;

      plugin.addCommand({
        id: 'move-file-to-bin',
        name: 'Move file to bin',
        icon:'trash-2',
        editorCallback: (editor: Editor, view: MarkdownView) => {
          moveFileToBin(editor, view, plugin.settings)
        }
      });

      plugin.addCommand({
        id: 'create-project',
        name: 'Create project',
        icon: 'folder-open-dot',
        callback: () => createProject(this.app, plugin.settings)
      });

      plugin.addCommand({
        id: 'test',
        name: 'test',
        callback: async () => {
          console.log(getTasksFromDate(this.app, "2025-01-14"));
        }
      });
      plugin.addCommand({
        id: 'add-task',
        name: 'Add task',
        callback: () => addTask(this.app)
      });
      
      // plugin.addCommand({
      //   id: 'task-start-time-to-now',
      //   name: 'Task start time to now',
      //   checkCallback: (checking: boolean) => {
      //     const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
      //     if (markdownView) {
      //       const cursor = markdownView.editor.getCursor();
      //       if (!cursor) return false;

      //       if (!checking) updateTaskTime(this.app)
      //       return true;
      //     }
      //     return false;
      //   }
      // });
    }
}