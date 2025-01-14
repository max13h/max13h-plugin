import { Plugin } from 'obsidian';
import { Commands } from 'src/commands';
import { Max13hSettingTab } from './settings'
// Remember to rename these classes and interfaces!

export interface Max13hPluginSettings {
	binFolder: string;
	projectTemplatePath: string;
	dailyNoteTemplatePath: string;
}

const DEFAULT_SETTINGS: Max13hPluginSettings = {
	binFolder: '_bin',
	projectTemplatePath: '',
	dailyNoteTemplatePath: ''
}

export default class Max13hPlugin extends Plugin {
	settings: Max13hPluginSettings;
	
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new Max13hSettingTab(this.app, this));


		new Commands({ plugin: this });
	}

	onunload() {}

	async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
