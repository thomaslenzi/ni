import { Command, Option } from "commander";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";

export function register(cli: Command) {
  cli
    .description("get available lists")
    .version("1.0.0", "-V")
    .addOption(new Option("-s, --search <keyword...>", "search keyword(s)"))
    .action(async (opts: { search?: string[] }) => {
      // Setup
      const outputId = `bruteforce_lists_${opts.search?.join("-") || "all"}`;
      // Command
      let cmd = `figlet "Ni!" \n`;
      cmd += `figlet "Lists" \n`;
      // Lists
      cmd += `find /opt/lists -type f -name *.txt`;
      opts.search?.forEach((search) => (cmd += ` | grep -i "${safe(search)}"`));
      // Run
      await runInContainer({
        outputId,
        cmd: cmd,
        stdout: process.stdout,
      });
    });
}
