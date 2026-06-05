import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import AIJournalCoachPlugin from "./main";
import { AIJournalCoachSettings } from "./settings";
import { validateLicense } from "./licenseManager";

export class AIJournalCoachSettingTab extends PluginSettingTab {
	plugin: AIJournalCoachPlugin;

	constructor(app: App, plugin: AIJournalCoachPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();


		// --- Journal Settings ---
		new Setting(containerEl).setName("Journal").setHeading();

		new Setting(containerEl)
			.setName("Journal folder")
			.setDesc("Folder containing your journal notes. Leave empty to search entire vault.")
			.addText((text) =>
				text
					.setPlaceholder("e.g. Journal or Daily Notes")
					.setValue(this.plugin.settings.journalFolder)
					.onChange(async (value) => {
						this.plugin.settings.journalFolder = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Days to analyze")
			.setDesc("How many days back to include in analysis.")
			.addDropdown((drop) =>
				drop
					.addOption("7", "Last 7 days")
					.addOption("14", "Last 14 days")
					.addOption("30", "Last 30 days")
					.addOption("90", "Last 90 days")
					.setValue(String(this.plugin.settings.daysBack))
					.onChange(async (value) => {
						this.plugin.settings.daysBack = parseInt(value);
						await this.plugin.saveSettings();
					})
			);

		// --- AI Provider ---
		new Setting(containerEl).setName("AI Provider").setHeading();

		new Setting(containerEl)
			.setName("Provider")
			.setDesc("Select your LLM provider.")
			.addDropdown((drop) =>
				drop
					.addOption("anthropic", "Anthropic (Claude)")
					.addOption("openai", "OpenAI")
					.addOption("openrouter", "OpenRouter")
					.addOption("custom", "Custom (OpenAI-compatible)")
					.setValue(this.plugin.settings.provider)
					.onChange(async (value) => {
						this.plugin.settings.provider = value as AIJournalCoachSettings["provider"];
						await this.plugin.saveSettings();
						this.display();
					})
			);

		new Setting(containerEl)
			.setName("API key")
			.setDesc("Your API key for the selected provider.")
			.addText((text) =>
				text
					.setPlaceholder("Enter your API key")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Model")
			.setDesc("Model ID to use for analysis.")
			.addText((text) =>
				text
					.setPlaceholder("e.g. claude-3-5-haiku-20241022")
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value.trim();
						await this.plugin.saveSettings();
					})
			);

		if (
			this.plugin.settings.provider === "custom" ||
			this.plugin.settings.provider === "openrouter"
		) {
			new Setting(containerEl)
				.setName("Custom base URL")
				.setDesc("Base URL for OpenAI-compatible endpoint.")
				.addText((text) =>
					text
						.setPlaceholder("https://openrouter.ai/api/v1")
						.setValue(this.plugin.settings.customBaseUrl)
						.onChange(async (value) => {
							this.plugin.settings.customBaseUrl = value.trim();
							await this.plugin.saveSettings();
						})
				);
		}

		// --- Pro License ---
		new Setting(containerEl).setName("Pro License").setHeading();

		new Setting(containerEl)
			.setName("License key")
			.setDesc("Enter your Pro license key to unlock unlimited usage.")
			.addText((text) =>
				text
					.setPlaceholder("Paste your license key here")
					.setValue(this.plugin.settings.licenseKey)
					.onChange(async (value) => {
						this.plugin.settings.licenseKey = value.trim();
						await this.plugin.saveSettings();
					})
			)
			.addButton((btn) =>
				btn
					.setButtonText("Activate")
					.setCta()
					.onClick(async () => {
						const result = validateLicense(this.plugin.settings.licenseKey);
						if (result.valid) {
							this.plugin.settings.isProActivated = true;
							await this.plugin.saveSettings();
							new Notice("✅ Pro license activated! Unlimited usage unlocked.");
							this.display();
						} else {
							this.plugin.settings.isProActivated = false;
							await this.plugin.saveSettings();
							new Notice("❌ Invalid license key: " + result.reason);
						}
					})
			);

		// --- Usage Status ---
		new Setting(containerEl).setName("Usage").setHeading();

		const status = this.plugin.settings.isProActivated
			? "✅ Pro activated — unlimited usage"
			: `Free tier — ${this.plugin.settings.usageCount} / 3 uses this month`;

		new Setting(containerEl).setName(status);
	}
}