import { Command, Option } from "commander";
import { runInContainer } from "../../lib/container";
import { createFileSync } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run a shell")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "file identifier").default(""))
    .action(async (opts: { id: string }) => {
      // Setup
      const [filePath] = createFileSync(
        "misc",
        "shell",
        opts.id || new Date().toISOString(),
      );
      // Run
      await runInContainer({
        cmd: "bash",
        stdout: process.stdout,
        files: [{ local: filePath, remote: "/data/out.txt" }],
      });
    });
}
