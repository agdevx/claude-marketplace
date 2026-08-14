#!/usr/bin/env node

/**
 * NUL File Cleanup Hook (PostToolUse)
 * Automatically detects and removes NUL files that Windows sometimes creates
 * when a reserved device name is inadvertently used as a filename.
 *
 * Checks the cwd and (for Write/Edit) the target file's parent directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/*
 * Stray NUL files are a Windows-only quirk. On Linux/macOS, "nul" is a
 * perfectly legal filename a user may have created on purpose, so deleting
 * it there would destroy real data. Bail out on any non-Windows platform.
 */
if (process.platform !== 'win32') {
	process.exit(0);
}

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
 * Attempt to delete a NUL file from the given directory.
 * Returns the full path if deleted, or null if no NUL file was found/deleted.
 */
function tryDeleteNul(dir) {
	try {
		const entries = fs.readdirSync(dir);
		const nulEntry = entries.find((e) => e.toUpperCase() === 'NUL');

		if (!nulEntry) return null;

		const nulPath = path.join(dir, nulEntry);

		//-- Verify it's actually a file (not a directory)
		try {
			const stat = fs.lstatSync(nulPath);
			if (!stat.isFile()) return null;
		} catch {
			return null;
		}

		//-- Try direct unlink first
		try {
			fs.unlinkSync(nulPath);
			return nulPath;
		} catch {
			//-- Fallback: use extended-length path prefix to bypass Windows device name handling
			try {
				execSync(`del /f /q "\\\\?\\${path.resolve(nulPath)}"`, { stdio: 'ignore' });
				return nulPath;
			} catch {
				return null;
			}
		}
	} catch {
		return null;
	}
}

/**
 * Main hook logic
 */
function main(inputData) {
	let hookInput;

	try {
		hookInput = JSON.parse(inputData);
	} catch {
		process.exit(0);
	}

	const toolInput = hookInput.tool_input || {};
	const cwd = hookInput.cwd || process.cwd();

	//-- Collect unique directories to check
	const dirsToCheck = new Set();
	dirsToCheck.add(path.resolve(cwd));

	//-- For file-targeting tools, also check the target file's parent directory
	const filePath = toolInput.file_path;
	if (filePath) {
		const dir = path.dirname(path.resolve(filePath));
		dirsToCheck.add(dir);
	}

	//-- Scan and delete
	const deleted = [];
	for (const dir of dirsToCheck) {
		const result = tryDeleteNul(dir);
		if (result) {
			deleted.push(result);
		}
	}

	//-- Report if anything was cleaned up
	if (deleted.length > 0) {
		const paths = deleted.join(', ');
		const output = {
			systemMessage: `NUL file cleanup: deleted ${paths}`
		};
		console.log(JSON.stringify(output));
	}

	process.exit(0);
}
