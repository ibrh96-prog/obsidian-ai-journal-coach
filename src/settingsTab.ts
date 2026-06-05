import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import AIJournalCoachPlugin from "./main";

export class AIJournalCoachSettingTab extends PluginSettingTab {
	plugin: AIJournalCoachPlugin;

	constructor(app: App, plugin: AIJournalCoachPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "AI Journal Coach Settings" });

		// --- Provider ---
		new Setting(containerEl)
			.setName("AI Provider")
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

		// --- API Key ---
		new Setting(containerEl)
			.setName("API Key")
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

		// --- Model ---
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

		// --- Custom Base URL ---
		if (this.plugin.settings.provider === "custom" || this.plugin.settings.provider === "openrouter") {
			new Setting(containerEl)
				.setName("Custom Base URL")
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

		// --- License ---
		containerEl.createEl("h3", { text: "Pro License" });

		new Setting(containerEl)
			.setName("License Key")
			.setDesc("Enter your Pro license key to unlock unlimited usage.")
			.addText((text) =>
				text
					.setPlaceholder("XXXX-XXXX-XXXX-XXXX")
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
						new Notice("License activation coming soon.");
					})
			);

		// --- Status ---
		const status = this.plugin.settings.isProActivated
			? "✅ Pro activated — unlimited usage"
			: `Free tier — ${this.plugin.settings.usageCount} / 3 uses this month`;

		containerEl.createEl("p", { text: status });
	}
}

// Re-export type for use in this file
import { AIJournalCoachSettings } from "./settings";