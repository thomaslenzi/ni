import { Command, Option } from "commander";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";

export function register(cli: Command) {
  cli
    .description("display available lists")
    .version("1.0.0", "-V")
    .addOption(new Option("-s, --search <keyword...>", "search keyword(s)"))
    .action(async (opts: { search?: string[] }) => {
      // Command
      let cmd = `figlet "ni" \n`;
      cmd += `figlet "lists" \n`;
      // Lists
      cmd += `find /opt/lists -type f -name *.txt`;
      if (opts.search)
        opts.search.forEach(
          (search) => (cmd += ` | grep -i "${safe(search)}"`),
        );
      // Run
      await runInContainer({
        cmd: cmd,
        stdout: process.stdout,
      });
    });
}
