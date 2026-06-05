import { Plugin } from "obsidian";
import { AIJournalCoachSettings, DEFAULT_SETTINGS } from "./settings";
import { AIJournalCoachSettingTab } from "./settingsTab";
import { AnalysisModal } from "./analysisModal";

export default class AIJournalCoachPlugin extends Plugin {
	settings: AIJournalCoachSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new AIJournalCoachSettingTab(this.app, this));

		this.addRibbonIcon("book-open", "AI Journal Coach", () => {
			new AnalysisModal(this.app, this).open();
		});

		this.addCommand({
			id: "open-journal-coach",
			name: "Open",
			callback: () => {
				new AnalysisModal(this.app, this).open();
			},
		});

		console.log("AI Journal Coach loaded.");
	}

	async onunload() {
		console.log("AI Journal Coach unloaded.");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}