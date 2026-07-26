# AI Journal Coach

An Obsidian plugin that analyzes your journal notes with AI to surface patterns, insights, and reflections.

## Features

- **Weekly Reflection** — Key themes, emotional landscape, wins, challenges, and a question to sit with
- **Pattern Detection** — Recurring themes, behavioral and emotional patterns
- **Mood Tracker** — Emotional tone, mood shifts, triggers, and energy levels
- **Growth Insights** — Personal growth, values in action, and an invitation forward

## How It Works

1. Write journal notes in Obsidian as you normally would
2. Open AI Journal Coach from the ribbon or command palette
3. Select an analysis type
4. Get a structured, empathetic analysis of your recent entries
5. Save the result directly to your vault

## Setup

1. Install the plugin from Obsidian Community Plugins
2. Go to **Settings → AI Journal Coach**
3. Select your AI provider (Anthropic, OpenAI, OpenRouter, or custom)
4. Enter your API key
5. Set your journal folder (or leave empty to search entire vault)
6. Open the plugin and run your first analysis

## Supported AI Providers

- **Anthropic** — Claude models (recommended: `claude-3-5-haiku-20241022`)
- **OpenAI** — GPT models (recommended: `gpt-4o-mini`)
- **OpenRouter** — Access to many models including free options (recommended: `meta-llama/llama-3.1-8b-instruct`)
- **Custom** — Any OpenAI-compatible endpoint

## Free vs Pro

| Feature | Free | Pro |
|---|---|---|
| Analyses | 10 total (lifetime) | Unlimited |
| All analysis modes | ✅ | ✅ |
| All AI providers | ✅ | ✅ |
| Save to vault | ✅ | ✅ |

The free tier allows 10 analyses in total. **This is a one-time lifetime allowance — it does not reset monthly.** An analysis that fails does not consume one of your free uses: the use is reserved before the request and refunded if the analysis does not complete.

The free allowance is stored in this vault's local plugin data. Each vault has its own allowance. Removing the plugin's local data may reset the recorded usage. There is no account and no server-side record of your usage.

Pro is a one-time purchase that removes the limit — no subscription, and no account. Your license key is verified offline on your own machine; activation never requires network access. Upgrade at [ibrh96.gumroad.com/l/hujko](https://ibrh96.gumroad.com/l/hujko).

Pro covers the plugin only. AI provider usage is billed separately by the provider whose API key you configure.

## Privacy

- Your notes never leave your device except to your chosen AI provider
- No servers, no databases, no telemetry
- Your API key is stored locally in Obsidian's data storage

## License

The source code in this repository is licensed under the **MIT License** — see [LICENSE](LICENSE).

Terms relating to the official Pro purchase — activation, license keys, refunds, warranty, and support — are set out in [EULA.md](EULA.md).