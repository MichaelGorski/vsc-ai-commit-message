import * as vscode from "vscode";
import * as cp from "node:child_process";
import * as util from "node:util";
import Anthropic from "@anthropic-ai/sdk";

const exec = util.promisify(cp.exec);

export function activate(context: vscode.ExtensionContext): void {
	const gitExtension =
		vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
	if (!gitExtension) {
		vscode.window.showErrorMessage("Git extension not found");
		return;
	}

	const git = gitExtension.getAPI(1);

	// biome-ignore lint/complexity/noForEach: <not needed with for Each>
	git.repositories.forEach((repo) => {
		repo.state.onDidChange(() => handleRepositoryStateChange(repo));
	});

	git.onDidOpenRepository((repo) => {
		repo.state.onDidChange(() => handleRepositoryStateChange(repo));
	});
}

async function handleRepositoryStateChange(repo: Repository): Promise<void> {
	if (repo.state.indexChanges.length > 0) {
		try {
			const diff = await getDiff(repo.rootUri.fsPath);
			const commitMessage = await generateCommitMessage(diff);

			// Set the commit message in the Source Control input box
			repo.inputBox.value = commitMessage;
		} catch (error) {
			vscode.window.showErrorMessage(
				`Error generating commit message: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}

async function getDiff(repoPath: string): Promise<string> {
	const { stdout } = await exec("git diff --cached", { cwd: repoPath });
	return stdout;
}

async function generateCommitMessage(diff: string): Promise<string> {
	const config = vscode.workspace.getConfiguration("aiCommitMessage");
	const apiKey = config.get<string>("anthropicApiKey");

	if (!apiKey) {
		throw new Error(
			"Anthropic API key not set. Please set it in your settings.",
		);
	}

	const anthropic = new Anthropic({
		apiKey: apiKey,
	});

	const prompt = `Based on the following git diff, write a concise and informative commit message:\n\n${diff}\n\nCommit message:`;

	const completion = await anthropic.completions.create({
		model: "claude-2.1",
		max_tokens_to_sample: 100,
		prompt: `Human: ${prompt}\n\nAssistant:`,
	});

	return completion.completion.trim();
}

export function deactivate(): void {}

// Updated type definitions for the Git extension API
interface GitExtension {
	getAPI(version: number): Git;
}

interface Git {
	repositories: Repository[];
	onDidOpenRepository: (
		listener: (repo: Repository) => void,
	) => vscode.Disposable;
}

interface Repository {
	rootUri: vscode.Uri;
	state: RepositoryState;
	inputBox: {
		value: string;
	};
}

interface RepositoryState {
	indexChanges: string[];
	onDidChange: (listener: () => void) => vscode.Disposable;
}
