import { App, Modal, Notice, MarkdownRenderer, Component } from "obsidian";
import AIJournalCoachPlugin from "./main";
import { runAnalysis, AnalysisMode } from "./journalAnalyzer";

const MODES: { value: AnalysisMode; label: string; description: string }[] = [
	{
		value: "weekly-reflection",
		label: "Weekly Reflection",
		description: "Themes, emotions, wins, challenges, and a question to sit with.",
	},
	{
		value: "pattern-detection",
		label: "Pattern Detection",
		description: "Recurring themes, behavioral and emotional patterns.",
	},
	{
		value: "mood-tracker",
		label: "Mood Tracker",
		description: "Emotional tone, mood shifts, triggers, and energy levels.",
	},
	{
		value: "growth-insights",
		label: "Growth Insights",
		description: "Personal growth, values in action, and an invitation forward.",
	},
];

export class AnalysisModal extends Modal {
	plugin: AIJournalCoachPlugin;
	selectedMode: AnalysisMode = "weekly-reflection";
	isLoading = false;

	constructor(app: App, plugin: AIJournalCoachPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		this.renderSelector();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	renderSelector() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "AI Journal Coach" });

		const sub = this.plugin.settings.isProActivated
			? "Pro — unlimited analyses"
			: `Free tier — ${this.plugin.settings.usageCount} / 3 uses this month`;
		contentEl.createEl("p", { text: sub, cls: "setting-item-description" });

		contentEl.createEl("h3", { text: "Select analysis type" });

		const modeContainer = contentEl.createDiv({ cls: "aj-mode-container" });

		MODES.forEach((mode) => {
			const card = modeContainer.createDiv({ cls: "aj-mode-card" });
			if (mode.value === this.selectedMode) {
				card.addClass("aj-mode-card--selected");
			}

			card.createEl("strong", { text: mode.label });
			card.createEl("p", { text: mode.description, cls: "setting-item-description" });

			card.addEventListener("click", () => {
				this.selectedMode = mode.value;
				modeContainer.querySelectorAll(".aj-mode-card").forEach((el) => {
					el.removeClass("aj-mode-card--selected");
				});
				card.addClass("aj-mode-card--selected");
			});
		});

		// Info
		const folder = this.plugin.settings.journalFolder || "entire vault";
		const days = this.plugin.settings.daysBack;
		contentEl.createEl("p", {
			text: `Analyzing last ${days} days from: ${folder}`,
			cls: "setting-item-description",
		});

		// Run button
		const btnRow = contentEl.createDiv({ cls: "aj-btn-row" });

		const runBtn = btnRow.createEl("button", {
			text: "Run Analysis",
			cls: "mod-cta",
		});

		runBtn.addEventListener("click", async () => {
			await this.runAnalysis();
		});
	}

	async runAnalysis() {
		if (this.isLoading) return;
		this.isLoading = true;

		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "AI Journal Coach" });
		contentEl.createEl("p", { text: "Analyzing your journal entries...", cls: "setting-item-description" });

		const spinner = contentEl.createDiv({ cls: "aj-spinner" });
		spinner.setText("⏳ Please wait...");

		const result = await runAnalysis(
			this.app,
			this.plugin.settings,
			this.plugin.saveSettings.bind(this.plugin),
			this.selectedMode,
			this.plugin.settings.journalFolder,
			this.plugin.settings.daysBack
		);

		this.isLoading = false;

		if (result.error) {
			contentEl.empty();
			contentEl.createEl("h2", { text: "AI Journal Coach" });
			contentEl.createEl("p", { text: "❌ " + result.error });

			const backBtn = contentEl.createEl("button", { text: "← Back" });
			backBtn.addEventListener("click", () => this.renderSelector());
			return;
		}

		this.renderResult(result.output, result.noteCount);
	}

	renderResult(output: string, noteCount: number) {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "AI Journal Coach" });
		contentEl.createEl("p", {
			text: `Analysis complete — ${noteCount} entries processed.`,
			cls: "setting-item-description",
		});

		const resultContainer = contentEl.createDiv({ cls: "aj-result" });

		MarkdownRenderer.render(
			this.app,
			output,
			resultContainer,
			"",
			new Component()
		);

		const btnRow = contentEl.createDiv({ cls: "aj-btn-row" });

		const saveBtn = btnRow.createEl("button", {
			text: "Save to vault",
			cls: "mod-cta",
		});
		saveBtn.addEventListener("click", async () => {
			await this.saveResultToVault(output);
		});

		const backBtn = btnRow.createEl("button", { text: "← New analysis" });
		backBtn.addEventListener("click", () => this.renderSelector());
	}

	async saveResultToVault(output: string) {
		const date = new Date().toISOString().split("T")[0];
		const modeName = this.selectedMode;
		const fileName = `Journal Analysis — ${modeName} — ${date}.md`;

		const header = `# Journal Analysis: ${modeName}\n*Generated on ${date} by AI Journal Coach*\n\n`;
		const fullContent = header + output;

		try {
			await this.app.vault.create(fileName, fullContent);
			new Notice(`Saved: ${fileName}`);
		} catch {
			new Notice("Could not save file. A file with this name may already exist.");
		}
	}
}