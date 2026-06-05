import { Plugin } from "obsidian";
import { AIJournalCoachSettings, DEFAULT_SETTINGS } from "./settings";
import { AIJournalCoachSettingTab } from "./settingsTab";
import { AnalysisModal } from "./analysisModal";

export default class AIJournalCoachPlugin extends Plugin {
	settings: AIJournalCoachSettings;

	override async onload(): Promise<void> {
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

	override onunload(): void {
		console.log("AI Journal Coach unloaded.");
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as AIJournalCoachSettings;
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}