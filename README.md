# ni

*Knights Who Say "Ni!"*

by [thomaslenzi](https://github.com/thomaslenzi/)

ni is a small, extensible CLI that collects pentesting utilities. The project is intended to be run with Bun (native TypeScript support) and includes a Docker image (based on Kali Linux) to run tools in an isolated environment.

**Status:** Work-in-progress - ready for local use and easy to extend with new tools.

**Highlights**
- Modular tools organized by category under `bin/tools`.
- Tools register themselves with the CLI via a `register` export.
- Runs natively with Bun and can execute tools inside a provided Kali-based Docker image for separation from the host.

**Contents**
- CLI entry: [bin/ni.ts](bin/ni.ts)
- Tools folder: [bin/tools](bin/tools)

**Prerequisites**
- Bun (https://bun.sh/) - used to run TypeScript scripts directly.
- Docker - used for running heavier pentest tools in an isolated container.
- git (to clone the repo).

Installation
------------

```bash
git clone XXX # Clone git repository
cd ni 
bun install # Install dependencies
bun run build # Build Docker image
chmod +x ./bin/ni.ts # Make file executable
echo "alias ni=$PWD/bin/ni.ts" > ~/.profile # Create ni command as alias
```

Creating a new tool
-------------------

Tools live under `bin/tools/<Category>/` as TypeScript files. Each tool module should export a `register` function that receives a Commander `Command` object and registers the tool (options, description, action).

Example tool skeleton (`bin/tools/Misc/hello.ts`):

```ts
import { Command } from "commander";

export function register(cli: Command) {
	cli
		.description("Say hello")
		.option("-n, --name <name>", "Name to greet", "world")
		.action((opts: { name: string }) => {
			console.log(`hello, ${opts.name}`);
		});
}
```

Notes when creating a tool
- Put the file under `bin/tools/<Category>/` (create the category directory if it doesn't exist).
- Export a `register` function as shown above.
- Use Commander options and `.action()` for tool behavior.
- Keep tools focused and small; the CLI auto-discovers any `.ts` file in the category directories and calls `register` if exported.
- A tool is automatically given a command (filename without its extension) and an alias (uppercase letters of the filename) by the CLI.

CLI discovery (how tools are loaded)
----------------------------------

The CLI entrypoint dynamically scans `bin/tools` and for each category directory creates a Commander subcommand. Each `.ts` tool file is imported and, if it exports a `register` function, that function is called with the category command. 

Project structure (short)
- `bin/ni.ts` - CLI entrypoint that auto-discovers tools.
- `bin/tools/` - categorized tool modules.
- `bin/lib/` - supporting shared helpers used by tools and the CLI.
- `container/` - container image definition and custom apps (Kali-based).
- `package.json` - project metadata and Docker build script.

Contributing
------------

- Follow the existing TypeScript style; `prettier` and `eslint` are included as dev dependencies.
- Open a PR with a clear summary and example commands to verify behavior.

Security
--------

This repository contains tooling intended for security testing. Use it only on systems you own or have explicit permission to test. The maintainers are not responsible for misuse.
