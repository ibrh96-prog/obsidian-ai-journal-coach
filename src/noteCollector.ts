import { App, TFile } from "obsidian";

export interface CollectedNote {
	title: string;
	content: string;
	date: string;
	path: string;
}

export async function collectJournalNotes(
	app: App,
	folderPath: string,
	daysBack: number
): Promise<CollectedNote[]> {
	const files = app.vault.getMarkdownFiles();
	const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;

	const journalFiles = files.filter((file) => {
		const inFolder = folderPath
			? file.path.startsWith(folderPath)
			: true;
		const isRecent = file.stat.mtime >= cutoff;
		return inFolder && isRecent;
	});

	journalFiles.sort((a, b) => a.stat.mtime - b.stat.mtime);

	const notes: CollectedNote[] = [];

	for (const file of journalFiles) {
		const content = await app.vault.read(file);
		if (content.trim().length === 0) continue;

		notes.push({
			title: file.basename,
			content: content,
			date: new Date(file.stat.mtime).toISOString().split("T")[0],
			path: file.path,
		});
	}

	return notes;
}

export function formatNotesForPrompt(notes: CollectedNote[]): string {
	if (notes.length === 0) return "No journal entries found.";

	return notes
		.map((note) => `## ${note.title} (${note.date})\n\n${note.content}`)
		.join("\n\n---\n\n");
}