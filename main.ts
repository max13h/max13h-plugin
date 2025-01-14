import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, moment } from 'obsidian';
import { Commands } from 'src/commands';
import { Max13hSettingTab } from './settings'
// Remember to rename these classes and interfaces!

export interface Max13hPluginSettings {
	binFolder: string;
	projectTemplatePath: string;
}

const DEFAULT_SETTINGS: Max13hPluginSettings = {
	binFolder: '_bin',
	projectTemplatePath: ''
}

export default class Max13hPlugin extends Plugin {
	settings: Max13hPluginSettings;
	
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new Max13hSettingTab(this.app, this));


		new Commands({ plugin: this });
	}

	onunload() {

	}

	async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
