import { Command, Option } from "commander";
import fs from "fs";
import path from "path";
import { runInContainer } from "../../lib/container";

export function register(cli: Command) {
  cli
    .description("run a shell")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .action(async (opts: { id?: string }) => {
      // Setup
      const outputId = `misc_shell_${opts.id || "session"}`;
      fs.mkdirSync(path.join(process.cwd(), "ni"), { recursive: true });
      // Run
      await runInContainer({
        outputId,
        cmd: "bash",
        stdout: process.stdout,
        files: [{ local: path.join(process.cwd(), "ni"), remote: "/data" }],
      });
    });
}
