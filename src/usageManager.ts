import { AIJournalCoachSettings } from "./settings";

const FREE_TIER_LIMIT = 10;

export function checkUsageLimit(settings: AIJournalCoachSettings): {
	allowed: boolean;
	remaining: number;
	reason?: string;
} {
	if (settings.isProActivated) {
		return { allowed: true, remaining: Infinity };
	}

	const remaining = FREE_TIER_LIMIT - settings.usageCount;

	if (remaining <= 0) {
		return {
			allowed: false,
			remaining: 0,
			reason: `You have used all ${FREE_TIER_LIMIT} free analyses. Upgrade to Pro for unlimited usage.`,
		};
	}

	return { allowed: true, remaining };
}

export async function incrementUsage(
	settings: AIJournalCoachSettings,
	saveSettings: () => Promise<void>
): Promise<void> {
	settings.usageCount += 1;
	await saveSettings();
}

export async function decrementUsage(
	settings: AIJournalCoachSettings,
	saveSettings: () => Promise<void>
): Promise<void> {
	settings.usageCount = Math.max(0, settings.usageCount - 1);
	await saveSettings();
}
