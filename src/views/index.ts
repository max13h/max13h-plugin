import { App } from 'obsidian';
import type Max13hPlugin from 'main';
import { VIEW_WEEKLY_REPORT, WeeklyReportView } from './weeklyReport';

export class Views {
    private readonly plugin: Max13hPlugin;

    private get app(): App {
        return this.plugin.app;
    }

    constructor({ plugin }: { plugin: Max13hPlugin }) {
      this.plugin = plugin;

      plugin.registerView(
        VIEW_WEEKLY_REPORT,
        (leaf) => new WeeklyReportView(leaf, this.app)
      );
    }
}