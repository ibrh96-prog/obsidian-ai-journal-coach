import { App } from "obsidian";
import { AIJournalCoachSettings } from "./settings";
import { callLLM } from "./llmAdapter";
import { collectJournalNotes, formatNotesForPrompt } from "./noteCollector";
import { checkUsageLimit, incrementUsage } from "./usageManager";

export type AnalysisMode =
	| "weekly-reflection"
	| "pattern-detection"
	| "mood-tracker"
	| "growth-insights";

export interface AnalysisResult {
	mode: AnalysisMode;
	output: string;
	error?: string;
	noteCount: number;
}

const SYSTEM_PROMPT = `You are a thoughtful journal coach. You analyze personal journal entries with empathy, insight, and honesty. You surface patterns, highlight growth, and ask meaningful questions. You never judge. You respond in clear, structured markdown.`;

const MODE_PROMPTS: Record<AnalysisMode, (notes: string, days: number) => string> = {
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
`,
};

export async function runAnalysis(
	app: App,
	settings: AIJournalCoachSettings,
	saveSettings: () => Promise<void>,
	mode: AnalysisMode,
	folderPath: string,
	daysBack: number
): Promise<AnalysisResult> {
	// Check usage
	const usage = checkUsageLimit(settings);
	if (!usage.allowed) {
		return {
			mode,
			output: "",
			error: usage.reason,
			noteCount: 0,
		};
	}

	// Collect notes
	const notes = await collectJournalNotes(app, folderPath, daysBack);
	if (notes.length === 0) {
		return {
			mode,
			output: "",
			error: `No journal entries found in the past ${daysBack} days. Make sure your journal folder path is set correctly in settings.`,
			noteCount: 0,
		};
	}

	const formatted = formatNotesForPrompt(notes);
	const prompt = MODE_PROMPTS[mode](formatted, daysBack);

	// Call LLM
	const response = await callLLM(prompt, SYSTEM_PROMPT, settings);
	if (response.error) {
		return { mode, output: "", error: response.error, noteCount: notes.length };
	}

	// Increment usage
	await incrementUsage(settings, saveSettings);

	return {
		mode,
		output: response.content,
		noteCount: notes.length,
	};
}