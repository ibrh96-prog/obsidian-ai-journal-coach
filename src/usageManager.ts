import { AIJournalCoachSettings } from "./settings";

const FREE_TIER_LIMIT = 3;

export function checkUsageLimit(settings: AIJournalCoachSettings): {
	allowed: boolean;
	remaining: number;
	reason?: string;
} {
	if (settings.isProActivated) {
		return { allowed: true, remaining: Infinity };
	}

	const currentMonth = new Date().getMonth();
	if (settings.usageResetMonth !== currentMonth) {
		return { allowed: true, remaining: FREE_TIER_LIMIT };
	}

	const remaining = FREE_TIER_LIMIT - settings.usageCount;

	if (remaining <= 0) {
		return {
			allowed: false,
			remaining: 0,
			reason: `You have used all ${FREE_TIER_LIMIT} free analyses this month. Upgrade to Pro for unlimited usage.`,
		};
	}

	return { allowed: true, remaining };
}

export async function incrementUsage(
	settings: AIJournalCoachSettings,
	saveSettings: () => Promise<void>
): Promise<void> {
	const currentMonth = new Date().getMonth();

	if (settings.usageResetMonth !== currentMonth) {
		settings.usageCount = 0;
		settings.usageResetMonth = currentMonth;
	}

	settings.usageCount += 1;
	await saveSettings();
}