/**
 * Shared command execution utilities for extensions and custom tools.
 */

import { spawn } from "node:child_process";

/**
 * Options for executing shell commands.
 */
export interface ExecOptions {
	/** AbortSignal to cancel the command */
	signal?: AbortSignal;
	/** Timeout in milliseconds */
	timeout?: number;
	/** Working directory */
	cwd?: string;
}

/**
 * Result of executing a shell command.
 */
export interface ExecResult {
	stdout: string;
	stderr: string;
	code: number;
	killed: boolean;
}

/**
 * Kill a process and its entire process group.
 */
function killTree(pid: number): void {
	try {
		process.kill(-pid, "SIGKILL");
	} catch {
		try {
			process.kill(pid, "SIGKILL");
		} catch {
			// already dead
		}
	}
}

/**
 * Execute a shell command and return stdout/stderr/code.
 * Supports timeout and abort signal via AbortSignal.any().
 * Settles immediately on abort/timeout — never waits for `close` after a kill.
 */
export async function execCommand(
	command: string,
	args: string[],
	cwd: string,
	options?: ExecOptions,
): Promise<ExecResult> {
	return new Promise((resolve) => {
		// Merge caller signal + timeout into one combined signal
		const signals: AbortSignal[] = [];
		if (options?.signal) signals.push(options.signal);
		if (options?.timeout && options.timeout > 0) signals.push(AbortSignal.timeout(options.timeout));
		const combined = signals.length > 0 ? AbortSignal.any(signals) : undefined;

		if (combined?.aborted) {
			resolve({ stdout: "", stderr: "", code: 1, killed: true });
			return;
		}

		const proc = spawn(command, args, {
			cwd,
			shell: false,
			detached: true,
			stdio: ["ignore", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";
		let settled = false;

		const onAbort = () => {
			if (settled) return;
			settled = true;
			if (proc.pid) killTree(proc.pid);
			resolve({ stdout, stderr, code: 1, killed: true });
		};

		if (combined) {
			combined.addEventListener("abort", onAbort, { once: true });
		}

		proc.stdout?.on("data", (data) => {
			stdout += data.toString();
		});

		proc.stderr?.on("data", (data) => {
			stderr += data.toString();
		});

		proc.on("close", (code) => {
			if (settled) return;
			settled = true;
			combined?.removeEventListener("abort", onAbort);
			resolve({ stdout, stderr, code: code ?? 0, killed: false });
		});

		proc.on("error", () => {
			if (settled) return;
			settled = true;
			combined?.removeEventListener("abort", onAbort);
			resolve({ stdout, stderr, code: 1, killed: false });
		});
	});
}
