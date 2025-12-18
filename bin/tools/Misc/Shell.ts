import { Command } from "commander";
import { runInContainer } from "../../lib/container";

export function register(cli: Command) {
  cli
    .description("run a shell")
    .version("1.0.0", "-V")
    .action(async () => {
      // Run
      await runInContainer({
        cmd: "bash",
        stdout: process.stdout,
      });
    });
}
