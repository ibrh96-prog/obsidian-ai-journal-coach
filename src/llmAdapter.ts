import { requestUrl } from "obsidian";
import { AIJournalCoachSettings } from "./settings";

export interface LLMResponse {
	content: string;
	error?: string;
}

export async function callLLM(
	prompt: string,
	systemPrompt: string,
	settings: AIJournalCoachSettings
): Promise<LLMResponse> {
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

async function callAnthropic(
	prompt: string,
	systemPrompt: string,
	settings: AIJournalCoachSettings
): Promise<LLMResponse> {
	const response = await requestUrl({
		url: "https://api.anthropic.com/v1/messages",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": settings.apiKey,
			"anthropic-version": "2023-06-01",
		},
		body: JSON.stringify({
			model: settings.model,
			max_tokens: 2048,
			system: systemPrompt,
			messages: [{ role: "user", content: prompt }],
		}),
	});

	if (response.status !== 200) {
		return { content: "", error: `Anthropic error: ${response.status}` };
	}

	const data = response.json as {
		content?: { text?: string }[];
	};
	return { content: data.content?.[0]?.text ?? "" };
}

async function callOpenAICompatible(
	prompt: string,
	systemPrompt: string,
	settings: AIJournalCoachSettings
): Promise<LLMResponse> {
	let baseUrl = "https://api.openai.com/v1";

	if (settings.provider === "openrouter") {
		baseUrl = "https://openrouter.ai/api/v1";
	} else if (settings.provider === "custom" && settings.customBaseUrl) {
		baseUrl = settings.customBaseUrl.replace(/\/$/, "");
	}

	const response = await requestUrl({
		url: `${baseUrl}/chat/completions`,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${settings.apiKey}`,
		},
		body: JSON.stringify({
			model: settings.model,
			max_tokens: 2048,
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: prompt },
			],
		}),
	});

	if (response.status !== 200) {
		return { content: "", error: `API error: ${response.status}` };
	}

	const data = response.json as {
		choices?: { message?: { content?: string } }[];
	};
	return { content: data.choices?.[0]?.message?.content ?? "" };
}