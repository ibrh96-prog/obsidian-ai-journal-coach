/* AI Journal Coach — Obsidian Plugin */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AIJournalCoachPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/settings.ts
var DEFAULT_SETTINGS = {
  provider: "anthropic",
  apiKey: "",
  model: "claude-3-5-haiku-20241022",
  customBaseUrl: "",
  licenseKey: "",
  isProActivated: false,
  usageCount: 0,
  usageResetMonth: (/* @__PURE__ */ new Date()).getMonth(),
  journalFolder: "",
  daysBack: 7
};

// src/settingsTab.ts
var import_obsidian = require("obsidian");
var AIJournalCoachSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "AI Journal Coach" });
    containerEl.createEl("h3", { text: "Journal Settings" });
    new import_obsidian.Setting(containerEl).setName("Journal folder").setDesc("Folder containing your journal notes. Leave empty to search entire vault.").addText(
      (text) => text.setPlaceholder("e.g. Journal or Daily Notes").setValue(this.plugin.settings.journalFolder).onChange(async (value) => {
        this.plugin.settings.journalFolder = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Days to analyze").setDesc("How many days back to include in analysis.").addDropdown(
      (drop) => drop.addOption("7", "Last 7 days").addOption("14", "Last 14 days").addOption("30", "Last 30 days").addOption("90", "Last 90 days").setValue(String(this.plugin.settings.daysBack)).onChange(async (value) => {
        this.plugin.settings.daysBack = parseInt(value);
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "AI Provider" });
    new import_obsidian.Setting(containerEl).setName("Provider").setDesc("Select your LLM provider.").addDropdown(
      (drop) => drop.addOption("anthropic", "Anthropic (Claude)").addOption("openai", "OpenAI").addOption("openrouter", "OpenRouter").addOption("custom", "Custom (OpenAI-compatible)").setValue(this.plugin.settings.provider).onChange(async (value) => {
        this.plugin.settings.provider = value;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    new import_obsidian.Setting(containerEl).setName("API key").setDesc("Your API key for the selected provider.").addText(
      (text) => text.setPlaceholder("Enter your API key").setValue(this.plugin.settings.apiKey).onChange(async (value) => {
        this.plugin.settings.apiKey = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Model").setDesc("Model ID to use for analysis.").addText(
      (text) => text.setPlaceholder("e.g. claude-3-5-haiku-20241022").setValue(this.plugin.settings.model).onChange(async (value) => {
        this.plugin.settings.model = value.trim();
        await this.plugin.saveSettings();
      })
    );
    if (this.plugin.settings.provider === "custom" || this.plugin.settings.provider === "openrouter") {
      new import_obsidian.Setting(containerEl).setName("Custom base URL").setDesc("Base URL for OpenAI-compatible endpoint.").addText(
        (text) => text.setPlaceholder("https://openrouter.ai/api/v1").setValue(this.plugin.settings.customBaseUrl).onChange(async (value) => {
          this.plugin.settings.customBaseUrl = value.trim();
          await this.plugin.saveSettings();
        })
      );
    }
    containerEl.createEl("h3", { text: "Pro License" });
    new import_obsidian.Setting(containerEl).setName("License key").setDesc("Enter your Pro license key to unlock unlimited usage.").addText(
      (text) => text.setPlaceholder("XXXX-XXXX-XXXX-XXXX").setValue(this.plugin.settings.licenseKey).onChange(async (value) => {
        this.plugin.settings.licenseKey = value.trim();
        await this.plugin.saveSettings();
      })
    ).addButton(
      (btn) => btn.setButtonText("Activate").setCta().onClick(async () => {
        new import_obsidian.Notice("License activation coming soon.");
      })
    );
    containerEl.createEl("h3", { text: "Usage" });
    const status = this.plugin.settings.isProActivated ? "\u2705 Pro activated \u2014 unlimited usage" : `Free tier \u2014 ${this.plugin.settings.usageCount} / 3 uses this month`;
    containerEl.createEl("p", { text: status });
  }
};

// src/analysisModal.ts
var import_obsidian2 = require("obsidian");

// src/llmAdapter.ts
async function callLLM(prompt, systemPrompt, settings) {
  if (!settings.apiKey) {
    return { content: "", error: "No API key configured. Please add your API key in settings." };
  }
  try {
    if (settings.provider === "anthropic") {
      return await callAnthropic(prompt, systemPrompt, settings);
    } else {
      return await callOpenAICompatible(prompt, systemPrompt, settings);
    }
  } catch (err) {
    return { content: "", error: `Request failed: ${String(err)}` };
  }
}
async function callAnthropic(prompt, systemPrompt, settings) {
  var _a, _b, _c;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": settings.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!response.ok) {
    const err = await response.text();
    return { content: "", error: `Anthropic error: ${response.status} \u2014 ${err}` };
  }
  const data = await response.json();
  return { content: (_c = (_b = (_a = data.content) == null ? void 0 : _a[0]) == null ? void 0 : _b.text) != null ? _c : "" };
}
async function callOpenAICompatible(prompt, systemPrompt, settings) {
  var _a, _b, _c, _d;
  let baseUrl = "https://api.openai.com/v1";
  if (settings.provider === "openrouter") {
    baseUrl = "https://openrouter.ai/api/v1";
  } else if (settings.provider === "custom" && settings.customBaseUrl) {
    baseUrl = settings.customBaseUrl.replace(/\/$/, "");
  }
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!response.ok) {
    const err = await response.text();
    return { content: "", error: `API error: ${response.status} \u2014 ${err}` };
  }
  const data = await response.json();
  return { content: (_d = (_c = (_b = (_a = data.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message) == null ? void 0 : _c.content) != null ? _d : "" };
}

// src/noteCollector.ts
async function collectJournalNotes(app, folderPath, daysBack) {
  const files = app.vault.getMarkdownFiles();
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1e3;
  const journalFiles = files.filter((file) => {
    const inFolder = folderPath ? file.path.startsWith(folderPath) : true;
    const isRecent = file.stat.mtime >= cutoff;
    return inFolder && isRecent;
  });
  journalFiles.sort((a, b) => a.stat.mtime - b.stat.mtime);
  const notes = [];
  for (const file of journalFiles) {
    const content = await app.vault.read(file);
    if (content.trim().length === 0) continue;
    notes.push({
      title: file.basename,
      content,
      date: new Date(file.stat.mtime).toISOString().split("T")[0],
      path: file.path
    });
  }
  return notes;
}
function formatNotesForPrompt(notes) {
  if (notes.length === 0) return "No journal entries found.";
  return notes.map((note) => `## ${note.title} (${note.date})

${note.content}`).join("\n\n---\n\n");
}

// src/usageManager.ts
var FREE_TIER_LIMIT = 3;
function checkUsageLimit(settings) {
  if (settings.isProActivated) {
    return { allowed: true, remaining: Infinity };
  }
  const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
  if (settings.usageResetMonth !== currentMonth) {
    return { allowed: true, remaining: FREE_TIER_LIMIT };
  }
  const remaining = FREE_TIER_LIMIT - settings.usageCount;
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `You have used all ${FREE_TIER_LIMIT} free analyses this month. Upgrade to Pro for unlimited usage.`
    };
  }
  return { allowed: true, remaining };
}
async function incrementUsage(settings, saveSettings) {
  const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
  if (settings.usageResetMonth !== currentMonth) {
    settings.usageCount = 0;
    settings.usageResetMonth = currentMonth;
  }
  settings.usageCount += 1;
  await saveSettings();
}

// src/journalAnalyzer.ts
var SYSTEM_PROMPT = `You are a thoughtful journal coach. You analyze personal journal entries with empathy, insight, and honesty. You surface patterns, highlight growth, and ask meaningful questions. You never judge. You respond in clear, structured markdown.`;
var MODE_PROMPTS = {
  "weekly-reflection": (notes, days) => `
Analyze these journal entries from the past ${days} days and provide a weekly reflection.

Structure your response as:
## Weekly Reflection
### Key Themes
### Emotional Landscape
### Wins & Highlights
### Challenges Faced
### One Question to Sit With

Journal entries:
${notes}
`,
  "pattern-detection": (notes, days) => `
Analyze these journal entries from the past ${days} days and identify recurring patterns.

Structure your response as:
## Pattern Analysis
### Recurring Themes
### Behavioral Patterns
### Emotional Patterns
### Patterns Worth Exploring Further

Journal entries:
${notes}
`,
  "mood-tracker": (notes, days) => `
Analyze the emotional tone and mood across these journal entries from the past ${days} days.

Structure your response as:
## Mood Analysis
### Overall Emotional Tone
### Mood Shifts & Triggers
### Energy Levels
### Emotional Needs That Appear

Journal entries:
${notes}
`,
  "growth-insights": (notes, days) => `
Analyze these journal entries from the past ${days} days through the lens of personal growth.

Structure your response as:
## Growth Insights
### How You Have Grown
### Values in Action
### Recurring Struggles (with compassion)
### Invitation for the Next Period

Journal entries:
${notes}
`
};
async function runAnalysis(app, settings, saveSettings, mode, folderPath, daysBack) {
  const usage = checkUsageLimit(settings);
  if (!usage.allowed) {
    return {
      mode,
      output: "",
      error: usage.reason,
      noteCount: 0
    };
  }
  const notes = await collectJournalNotes(app, folderPath, daysBack);
  if (notes.length === 0) {
    return {
      mode,
      output: "",
      error: `No journal entries found in the past ${daysBack} days. Make sure your journal folder path is set correctly in settings.`,
      noteCount: 0
    };
  }
  const formatted = formatNotesForPrompt(notes);
  const prompt = MODE_PROMPTS[mode](formatted, daysBack);
  const response = await callLLM(prompt, SYSTEM_PROMPT, settings);
  if (response.error) {
    return { mode, output: "", error: response.error, noteCount: notes.length };
  }
  await incrementUsage(settings, saveSettings);
  return {
    mode,
    output: response.content,
    noteCount: notes.length
  };
}

// src/analysisModal.ts
var MODES = [
  {
    value: "weekly-reflection",
    label: "Weekly Reflection",
    description: "Themes, emotions, wins, challenges, and a question to sit with."
  },
  {
    value: "pattern-detection",
    label: "Pattern Detection",
    description: "Recurring themes, behavioral and emotional patterns."
  },
  {
    value: "mood-tracker",
    label: "Mood Tracker",
    description: "Emotional tone, mood shifts, triggers, and energy levels."
  },
  {
    value: "growth-insights",
    label: "Growth Insights",
    description: "Personal growth, values in action, and an invitation forward."
  }
];
var AnalysisModal = class extends import_obsidian2.Modal {
  constructor(app, plugin) {
    super(app);
    this.selectedMode = "weekly-reflection";
    this.isLoading = false;
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
    const sub = this.plugin.settings.isProActivated ? "Pro \u2014 unlimited analyses" : `Free tier \u2014 ${this.plugin.settings.usageCount} / 3 uses this month`;
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
    const folder = this.plugin.settings.journalFolder || "entire vault";
    const days = this.plugin.settings.daysBack;
    contentEl.createEl("p", {
      text: `Analyzing last ${days} days from: ${folder}`,
      cls: "setting-item-description"
    });
    const btnRow = contentEl.createDiv({ cls: "aj-btn-row" });
    const runBtn = btnRow.createEl("button", {
      text: "Run Analysis",
      cls: "mod-cta"
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
    spinner.setText("\u23F3 Please wait...");
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
      contentEl.createEl("p", { text: "\u274C " + result.error });
      const backBtn = contentEl.createEl("button", { text: "\u2190 Back" });
      backBtn.addEventListener("click", () => this.renderSelector());
      return;
    }
    this.renderResult(result.output, result.noteCount);
  }
  renderResult(output, noteCount) {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "AI Journal Coach" });
    contentEl.createEl("p", {
      text: `Analysis complete \u2014 ${noteCount} entries processed.`,
      cls: "setting-item-description"
    });
    const resultContainer = contentEl.createDiv({ cls: "aj-result" });
    import_obsidian2.MarkdownRenderer.render(
      this.app,
      output,
      resultContainer,
      "",
      new import_obsidian2.Component()
    );
    const btnRow = contentEl.createDiv({ cls: "aj-btn-row" });
    const saveBtn = btnRow.createEl("button", {
      text: "Save to vault",
      cls: "mod-cta"
    });
    saveBtn.addEventListener("click", async () => {
      await this.saveResultToVault(output);
    });
    const backBtn = btnRow.createEl("button", { text: "\u2190 New analysis" });
    backBtn.addEventListener("click", () => this.renderSelector());
  }
  async saveResultToVault(output) {
    const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const modeName = this.selectedMode;
    const fileName = `Journal Analysis \u2014 ${modeName} \u2014 ${date}.md`;
    const header = `# Journal Analysis: ${modeName}
*Generated on ${date} by AI Journal Coach*

`;
    const fullContent = header + output;
    try {
      await this.app.vault.create(fileName, fullContent);
      new import_obsidian2.Notice(`Saved: ${fileName}`);
    } catch (e) {
      new import_obsidian2.Notice("Could not save file. A file with this name may already exist.");
    }
  }
};

// src/main.ts
var AIJournalCoachPlugin = class extends import_obsidian3.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new AIJournalCoachSettingTab(this.app, this));
    this.addRibbonIcon("book-open", "AI Journal Coach", () => {
      new AnalysisModal(this.app, this).open();
    });
    this.addCommand({
      id: "open-journal-coach",
      name: "Open AI Journal Coach",
      callback: () => {
        new AnalysisModal(this.app, this).open();
      }
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
};
