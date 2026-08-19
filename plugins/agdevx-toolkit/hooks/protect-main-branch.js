#!/usr/bin/env node

/**
 * Main Branch Protection Hook
 * Prevents accidental modifications to protected branches (main, master, production, prod)
 * Provides smart branch name suggestions and helpful guidance
 */

const { execSync } = require('child_process');

//-- Read hook input from stdin
let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
	input += chunk;
});

process.stdin.on('end', () => {
	main(input);
});

/**
 * Execute shell command and return output
 */
function runCommand(command) {
	try {
		const output = execSync(command, {
			encoding: 'utf8',
			stdio: ['pipe', 'pipe', 'pipe']
		});
		return output.trim();
	} catch (error) {
		return '';
	}
}

/**
 * Extract a directory a Bash command explicitly `cd`s into before running
 * its real command (e.g. `cd "C:\repo" && git commit ...`). Cross-repo
 * commands from a session rooted elsewhere would otherwise be checked
 * against the session's cwd instead of the repo the command actually targets.
 */
function extractCdTarget(command) {
	const match = command.match(/^\s*cd\s+(?:"([^"]+)"|'([^']+)'|(\S+))\s*(?:&&|;)/);
	if (!match) {
		return null;
	}

	return match[1] || match[2] || match[3] || null;
}

/**
 * Check if we're in a git repository
 */
function isGitRepo() {
	try {
		execSync('git rev-parse --git-dir', { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

/**
 * Extract Jira issue ID from git context
 */
function extractJiraIssue() {
	// Check current branch
	const branch = runCommand('git branch --show-current');
	const branchMatch = branch.match(/([A-Z]+-\d+)/);
	if (branchMatch) {
		return branchMatch[1];
	}

	//-- Check recent commits
	const commits = runCommand('git log -10 --oneline');
	const commitMatch = commits.match(/([A-Z]+-\d+)/);
	if (commitMatch) {
		return commitMatch[1];
	}

	return null;
}

/**
 * Suggest a branch name based on context
 */
function suggestBranchName(filePath, jiraIssue = null) {
	let baseBranch = '';

	if (!filePath) {
		baseBranch = 'feature/new-changes';
	} else {
		const filename = filePath
			.split('/')
			.pop()
			.replace(/\.[^.]*$/, '');
		const directory = filePath.split('/').slice(-2, -1)[0] || '';

		//-- Determine branch type based on file path
		if (filePath.includes('test') || filePath.includes('spec') || filePath.includes('.test.')) {
			baseBranch = `test/${filename}`;
		} else if (filePath.includes('doc') || filePath.endsWith('.md') || filePath.includes('README')) {
			baseBranch = `docs/update-${filename}`;
		} else if (filePath.includes('bug') || filePath.includes('fix')) {
			baseBranch = `fix/${filename}`;
		} else if (filePath.includes('config') || filePath.endsWith('.json') || filePath.endsWith('.yaml')) {
			baseBranch = `config/${filename}`;
		} else {
			//-- Default to feature branch with directory context
			if (directory && directory !== '.') {
				baseBranch = `feature/${directory}-${filename}`;
			} else {
				baseBranch = `feature/${filename}`;
			}
		}

		//-- Clean up branch name
		baseBranch = baseBranch
			.replace(/[^a-zA-Z0-9/_-]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '')
			.substring(0, 50);
	}

	//-- Prepend Jira issue Id if found
	if (jiraIssue) {
		return `${jiraIssue}-${baseBranch}`;
	}

	return baseBranch;
}

/**
 * Generate helpful error message
 */
function generateErrorMessage(currentBranch, suggestedBranch, filePath = null, command = null) {
	let message = `🚫 PROTECTED BRANCH: Cannot modify '${currentBranch}' branch directly

📋 What you need to do:
1. Create a feature branch
2. Make your changes on that branch
3. Create a PR to merge back to ${currentBranch}

💡 Suggested branch name:
   git checkout -b ${suggestedBranch}

📝 Alternative branch naming:
   feature/descriptive-name  - For new features
   fix/bug-description      - For bug fixes
   refactor/component-name  - For refactoring
   docs/what-changed        - For documentation
   test/what-testing        - For tests

🔧 Quick start:
   git checkout -b ${suggestedBranch} && git push -u origin ${suggestedBranch}`;

	if (filePath) {
		message += `\n\n📁 File you were trying to modify: ${filePath}`;
	}

	if (command) {
		message += `\n\n⚠️  Command attempted: ${command}`;
	}

	return message;
}

/**
 * Main hook logic
 */
function main(inputData) {
	let hookInput;

	try {
		hookInput = JSON.parse(inputData);
	} catch (error) {
		console.error('Error parsing JSON input:', error.message);
		process.exit(1);
	}

	const toolName = hookInput.tool_name || '';
	const toolInput = hookInput.tool_input || {};
	const cwd = hookInput.cwd || process.cwd();

	//-- Change to project directory
	try {
		process.chdir(cwd);
	} catch (error) {
		process.exit(0);
	}

	//-- If this Bash command explicitly cd's into another repo, check branch protection
	//-- against THAT repo instead of the session's fixed cwd
	if (toolName === 'Bash') {
		const cdTarget = extractCdTarget(toolInput.command || '');
		if (cdTarget) {
			try {
				process.chdir(cdTarget);
			} catch (error) {
				//-- Target doesn't exist or isn't accessible; fall back to session cwd
			}
		}
	}

	//-- Check if we're in a git repository
	if (!isGitRepo()) {
		process.exit(0);
	}

	//-- Get current branch
	const currentBranch = runCommand('git branch --show-current');

	//-- Define protected branches
	const protectedBranches = ['main', 'master', 'production', 'prod', 'release'];

	//-- Block deletion of protected branches from ANY branch
	if (toolName === 'Bash') {
		const command = toolInput.command || '';
		const branchDeleteMatch = command.match(/git\s+branch\s+-[dD]\s+(.+)/);
		if (branchDeleteMatch) {
			const targetBranch = branchDeleteMatch[1].trim();
			if (protectedBranches.includes(targetBranch)) {
				const errorMessage = `🚫 BLOCKED: Cannot delete protected branch '${targetBranch}'

⚠️  Command attempted:
   ${command}

Protected branches (${protectedBranches.join(', ')}) cannot be deleted.`;

				const output = {
					decision: 'block',
					reason: `🚫 Cannot delete protected branch '${targetBranch}'`,
					hookSpecificOutput: {
						hookEventName: 'PreToolUse',
						permissionDecision: 'deny',
						permissionDecisionReason: errorMessage
					}
				};

				console.log(JSON.stringify(output));
				process.exit(2);
			}
		}
	}

	//-- Check if current branch is protected
	const isProtected = protectedBranches.includes(currentBranch);

	if (!isProtected) {
		process.exit(0);
	}

	//-- Define safe read-only tools
	const safeTools = ['Read', 'Grep', 'Glob'];

	//-- Check if tool is in safe list
	if (safeTools.includes(toolName)) {
		process.exit(0);
	}

	//-- Handle file modification tools
	if (['Write', 'Edit'].includes(toolName)) {
		const filePath = toolInput.file_path || '';

		//-- Skip protection for files outside this repository
		const repoRoot = runCommand('git rev-parse --show-toplevel').replace(/\\/g, '/');
		const normalizedFilePath = filePath.replace(/\\/g, '/');
		if (repoRoot && !normalizedFilePath.startsWith(repoRoot)) {
			process.exit(0);
		}

		const jiraIssue = extractJiraIssue();
		const suggestedBranch = suggestBranchName(filePath, jiraIssue);
		const errorMessage = generateErrorMessage(currentBranch, suggestedBranch, filePath);

		//-- Return blocking response
		const output = {
			decision: 'block',
			reason: `🚫 Cannot modify files on protected branch '${currentBranch}'`,
			hookSpecificOutput: {
				hookEventName: 'PreToolUse',
				permissionDecision: 'deny',
				permissionDecisionReason: errorMessage
			}
		};

		console.log(JSON.stringify(output));
		process.exit(2);
	}

	//-- Handle bash commands
	if (toolName === 'Bash') {
		const command = toolInput.command || '';

		//-- Check for dangerous git commands
		const dangerousGitPattern = /git\s+(commit|push|merge|rebase|reset\s+--hard|branch\s+-D)/;

		if (dangerousGitPattern.test(command)) {
			const errorMessage = `🚫 BLOCKED: Cannot run git modification commands on '${currentBranch}'

⚠️  Command attempted:
   ${command}

📋 This command modifies git history or branches, which is not allowed on protected branches.

💡 Create a feature branch first:
   git checkout -b feature/your-feature-name

Then you can safely run git commands on your feature branch.`;

			const output = {
				decision: 'block',
				reason: `🚫 Dangerous git command blocked on protected branch '${currentBranch}'`,
				hookSpecificOutput: {
					hookEventName: 'PreToolUse',
					permissionDecision: 'deny',
					permissionDecisionReason: errorMessage
				}
			};

			console.log(JSON.stringify(output));
			process.exit(2);
		}

		//-- Check for other potentially dangerous commands
		const dangerousPattern = /\brm\s+-rf\b|\bsudo\b/;

		if (dangerousPattern.test(command)) {
			const warningMessage = `⚠️  WARNING: You are running a potentially destructive command on '${currentBranch}':

   ${command}

Are you sure you want to proceed on the protected branch?

💡 Consider: Create a feature branch first for safety.`;

			const output = {
				hookSpecificOutput: {
					hookEventName: 'PreToolUse',
					permissionDecision: 'ask',
					permissionDecisionReason: warningMessage
				}
			};

			console.log(JSON.stringify(output));
			process.exit(0);
		}
	}

	//-- Safe operation, allow
	process.exit(0);
}
