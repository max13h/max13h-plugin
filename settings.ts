import Max13hPlugin from './main';
import { App, PluginSettingTab, Setting } from 'obsidian';

export class Max13hSettingTab extends PluginSettingTab {
  plugin: Max13hPlugin;

  constructor(app: App, plugin: Max13hPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Bin folder')
      .setDesc("Set name of the bin folder (for 'move to bin' command)")
      .addText((text) =>
        text
          .setPlaceholder('_bin')
          .setValue(this.plugin.settings.binFolder)
          .onChange(async (value) => {
            this.plugin.settings.binFolder = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName('Project template')
      .setDesc("Set path of the project template file (for 'create project' command)")
      .addText((text) =>
        text
          .setPlaceholder('templates/projects')
          .setValue(this.plugin.settings.projectTemplatePath)
          .onChange(async (value) => {
            this.plugin.settings.projectTemplatePath = value;
            await this.plugin.saveSettings();
          })
      );
  }
}