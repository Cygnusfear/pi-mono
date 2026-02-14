#!/usr/bin/env node
/**
 * CLI entry point for the refactored coding agent.
 * Uses main.ts with AgentSession and new mode modules.
 *
 * Test with: npx tsx src/cli-new.ts [args...]
 */
process.title = "pi";

// Fast path: handle --version and --help before importing the full module graph
const args = process.argv.slice(2);
if (args.includes("--version") || args.includes("-v")) {
	const { VERSION } = await import("./config.js");
	console.log(VERSION);
	process.exit(0);
}
if (args.includes("--help") || args.includes("-h")) {
	const { printHelp } = await import("./cli/args.js");
	printHelp();
	process.exit(0);
}

const { main } = await import("./main.js");
main(args);
