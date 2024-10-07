# AI Commit Message Generator

## Overview

The AI Commit Message Generator is a Visual Studio Code extension that automatically generates commit messages for your Git repositories using artificial intelligence. This extension leverages the power of Anthropic's Claude AI to analyze your staged changes and create meaningful, context-aware commit messages.

## Features

- Automatically generates commit messages when changes are staged in Git
- Uses Anthropic's Claude AI for intelligent message generation
- Seamlessly integrates with VS Code's source control features
- Customizable through VS Code settings

## Requirements

- Visual Studio Code 1.60.0 or higher
- Git installed and configured in your system
- An Anthropic API key

## Installation

1. Download the `.vsix` file from the latest release.
2. Open Visual Studio Code.
3. Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X on Mac).
4. Click on the "..." (More Actions) at the top of the Extensions view.
5. Select "Install from VSIX...".
6. Choose the downloaded `.vsix` file.
7. Reload VS Code if prompted.

## Configuration

1. Open VS Code Settings (File > Preferences > Settings or Ctrl+,).
2. Search for "AI Commit Message".
3. Find the "Anthropic Api Key" field and enter your Anthropic API key.

## Usage

1. Open a Git repository in VS Code.
2. Make changes to your files.
3. Stage your changes using VS Code's Source Control view or Git commands.
4. The extension will automatically generate a commit message based on your staged changes.
5. Review the generated message in the Source Control input box.
6. Modify the message if needed, or commit directly if you're satisfied.

## How It Works

The extension listens for changes in your Git repositories. When you stage changes, it uses the Anthropic API to analyze the diff and generate a contextual commit message. This message is then automatically inserted into the commit message input box in the Source Control view.

## Troubleshooting

If you encounter any issues:

1. Check the Output panel (View > Output) and select "AI Commit Message" from the dropdown to see any error messages or logs.
2. Ensure your Anthropic API key is correctly set in the VS Code settings.
3. Make sure you have an active internet connection for the AI to function.
4. If the extension seems unresponsive, try reloading the VS Code window (Ctrl+R or Cmd+R on Mac).

## Contributing

Contributions to the AI Commit Message Generator are welcome! Please feel free to submit pull requests, create issues or spread the word.

## License

[MIT License](LICENSE)

## Disclaimer

This extension sends diff information to Anthropic's API for processing. Please ensure you're comfortable with this and that it complies with your organization's policies before use.

---

For more information or to report issues, please visit the [GitHub repository](https://github.com/yourusername/ai-commit-message).