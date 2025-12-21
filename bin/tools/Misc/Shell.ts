import { Command, Option } from "commander";
import { runInContainer } from "../../lib/container";
import { createFileSync } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run a shell")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .action(async (opts: { id?: string }) => {
      // Setup
      const outputId = `misc_shell_${opts.id || "session"}`;
      const [filePath] = createFileSync(outputId);
      // Run
      await runInContainer({
        outputId,
        cmd: "bash",
        stdout: process.stdout,
        files: [{ local: filePath, remote: "/data/out.txt" }],
      });
    });
}
