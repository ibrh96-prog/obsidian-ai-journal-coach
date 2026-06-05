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
var import_obsidian2 = require("obsidian");

// src/settings.ts
var DEFAULT_SETTINGS = {
  provider: "anthropic",
  apiKey: "",
  model: "claude-3-5-haiku-20241022",
  customBaseUrl: "",
  licenseKey: "",
  isProActivated: false,
  usageCount: 0,
  usageResetMonth: (/* @__PURE__ */ new Date()).getMonth()
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
    containerEl.createEl("h2", { text: "AI Journal Coach Settings" });
    new import_obsidian.Setting(containerEl).setName("AI Provider").setDesc("Select your LLM provider.").addDropdown(
      (drop) => drop.addOption("anthropic", "Anthropic (Claude)").addOption("openai", "OpenAI").addOption("openrouter", "OpenRouter").addOption("custom", "Custom (OpenAI-compatible)").setValue(this.plugin.settings.provider).onChange(async (value) => {
        this.plugin.settings.provider = value;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    new import_obsidian.Setting(containerEl).setName("API Key").setDesc("Your API key for the selected provider.").addText(
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
      new import_obsidian.Setting(containerEl).setName("Custom Base URL").setDesc("Base URL for OpenAI-compatible endpoint.").addText(
        (text) => text.setPlaceholder("https://openrouter.ai/api/v1").setValue(this.plugin.settings.customBaseUrl).onChange(async (value) => {
          this.plugin.settings.customBaseUrl = value.trim();
          await this.plugin.saveSettings();
        })
      );
    }
    containerEl.createEl("h3", { text: "Pro License" });
    new import_obsidian.Setting(containerEl).setName("License Key").setDesc("Enter your Pro license key to unlock unlimited usage.").addText(
      (text) => text.setPlaceholder("XXXX-XXXX-XXXX-XXXX").setValue(this.plugin.settings.licenseKey).onChange(async (value) => {
        this.plugin.settings.licenseKey = value.trim();
        await this.plugin.saveSettings();
      })
    ).addButton(
      (btn) => btn.setButtonText("Activate").setCta().onClick(async () => {
        new import_obsidian.Notice("License activation coming soon.");
      })
    );
    const status = this.plugin.settings.isProActivated ? "\u2705 Pro activated \u2014 unlimited usage" : `Free tier \u2014 ${this.plugin.settings.usageCount} / 3 uses this month`;
    containerEl.createEl("p", { text: status });
  }
};

// src/main.ts
var AIJournalCoachPlugin = class extends import_obsidian2.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new AIJournalCoachSettingTab(this.app, this));
    new import_obsidian2.Notice("AI Journal Coach loaded.");
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
};
