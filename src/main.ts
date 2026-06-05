import { Plugin, Notice } from "obsidian";
import { AIJournalCoachSettings, DEFAULT_SETTINGS } from "./settings";
import { AIJournalCoachSettingTab } from "./settingsTab";

export default class AIJournalCoachPlugin extends Plugin {
	settings: AIJournalCoachSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new AIJournalCoachSettingTab(this.app, this));
		new Notice("AI Journal Coach loaded.");
		console.log("AI Journal Coach plugin loaded.");
	}

	async onunload() {
		console.log("AI Journal Coach plugin unloaded.");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}