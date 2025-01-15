import { App, Editor, MarkdownFileInfo, MarkdownView, Notice, View } from 'obsidian';
import { moveFileToBin } from './moveFileToBin';
import { createProject } from './createProject';
import { addTask } from './addTask';
import type Max13hPlugin from 'main';
import { catchQuickThinking } from './catchQuickThinking';
import { updateTaskTime } from './updateTaskTime';
import { duplicateActualTask } from './duplicateActualTask';

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
        icon: 'folder-heart',
        callback: () => createProject(this.app, plugin.settings)
      });

      plugin.addCommand({
        id: 'add-task',
        name: 'Add task',
        icon: 'check-check',
        callback: () => addTask(this.app)
      });

      plugin.addCommand({
        id: 'catch-quick-thinking',
        name: 'Catch quick thinking',
        icon: 'zap',
        callback: () => catchQuickThinking(this.app, plugin.settings)
      });
      
      plugin.addCommand({
        id: 'update-task-time',
        name: 'Update task time',
        icon: 'watch',
        callback: () => updateTaskTime(this.app)
      });
      
      plugin.addCommand({
        id: 'duplicate-actual-task',
        name: 'Duplicate actual task',
        icon: 'gallery-horizontal-end',
        editorCallback: (editor: Editor) => {
          const cursor = editor.getCursor();
          if (!cursor) return;
          const lineContent = editor.getLine(cursor.line);
          if (!lineContent.startsWith("- [")) return;
          duplicateActualTask(editor, cursor, lineContent);
        }
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