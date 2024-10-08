import * as vscode from "vscode";
import * as cp from "node:child_process";
import * as util from "node:util";
import Anthropic from "@anthropic-ai/sdk";

const exec = util.promisify(cp.exec);

export function activate(context: vscode.ExtensionContext): void {
	console.log("AI Commit Message extension is now active!");
	const gitExtension =
		vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
	if (!gitExtension) {
		vscode.window.showErrorMessage("Git extension not found");
		return;
	}

	const git = gitExtension.getAPI(1);

	context.subscriptions.push(
		git.onDidOpenRepository((repo) => {
			const disposable = repo.state.onDidChange(() =>
				handleRepositoryStateChange(repo),
			);
			context.subscriptions.push(disposable);
		}),
	);

	// biome-ignore lint/complexity/noForEach: <not needed for each>
	git.repositories.forEach((repo) => {
		const disposable = repo.state.onDidChange(() =>
			handleRepositoryStateChange(repo),
		);
		context.subscriptions.push(disposable);
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
			if (error instanceof Error && error.name === "Canceled") {
				// Operation was canceled, likely due to the extension host restarting
				console.log("Operation canceled:", error.message);
			} else {
				vscode.window.showErrorMessage(
					`Error generating commit message: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	}
}

async function getDiff(repoPath: string): Promise<string> {
	try {
		const { stdout } = await exec("git diff --cached", { cwd: repoPath });
		return stdout;
	} catch (error) {
		console.error("Error getting diff:", error);
		throw new Error("Failed to get Git diff");
	}
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

	const prompt = `Generate a concise and informative git commit message based on the following diff summary:

${diff}

Please follow these guidelines:
1. Start with a brief (50 characters or less) summary of the change.
2. Follow with a more detailed explanation, if necessary.
3. Use the imperative mood in the subject line (e.g., "Add feature" not "Added feature").
4. Mention any breaking changes.
5. Reference relevant issue numbers if applicable.
6. Explain the motivation for the change and how it differs from previous behavior.

Format the message like this:

<type>(<scope>): <subject>

<body>

<footer>

Where:
- <type> is one of: feat, fix, docs, style, refactor, test, chore
- <scope> is optional and represents the module affected
- <subject> is a short summary
- <body> provides detailed description (if needed)
- <footer> contains any breaking changes or issue references

Example types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- test: Adding missing tests or correcting existing tests
- chore: Changes to the build process or auxiliary tools and libraries

Commit message:`;

	try {
		const completion = await anthropic.completions.create({
			model: "claude-3-5-sonnet-20240620",
			max_tokens_to_sample: 400, // Increased to allow for longer messages
			prompt: `Human: ${prompt}\n\nAssistant:`,
		});

		return completion.completion.trim();
	} catch (error) {
		console.error("Error generating commit message:", error);
		throw new Error("Failed to generate commit message");
	}
}

export function deactivate(): void {}

// Type definitions for the Git extension API
interface GitExtension {
	getAPI(version: number): Git;
}

interface Git {
	repositories: Repository[];
	onDidOpenRepository: (
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		listener: (repo: Repository) => any,
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
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	onDidChange: (listener: () => any) => vscode.Disposable;
}
