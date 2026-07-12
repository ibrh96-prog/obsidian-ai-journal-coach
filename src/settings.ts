export interface AIJournalCoachSettings {
	provider: "anthropic" | "openai" | "openrouter" | "custom";
	apiKey: string;
	model: string;
	customBaseUrl: string;
	licenseKey: string;
	isProActivated: boolean;
	usageCount: number;
	journalFolder: string;
	daysBack: number;
}

export const DEFAULT_SETTINGS: AIJournalCoachSettings = {
	provider: "anthropic",
	apiKey: "",
	model: "claude-3-5-haiku-20241022",
	customBaseUrl: "",
	licenseKey: "",
	isProActivated: false,
	usageCount: 0,
	journalFolder: "",
	daysBack: 7,
};