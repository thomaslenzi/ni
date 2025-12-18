import { Command, Option } from "commander";
import { runInContainer } from "../../lib/container";
import { createFileSync } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("generate usernames (username-anarchy)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output identifier").default(""))
    .addOption(
      new Option("-n, --name <names...>", "names").makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "--flags-username-anarchy <flags>",
        "username-anarchy flags",
      ).default(""),
    )
    .action(
      async (opts: {
        id: string;
        name: string[];
        flagsUsernameAnarchy: string;
      }) => {
        // Setup
        const [fileName] = createFileSync(
          "bruteforce",
          "usernames",
          opts.id || opts.name.join("-"),
        );
        // Command
        let cmd = `figlet "ni" && `;
        // Username-Anarchy
        cmd += `figlet "username-anarchy" && `;
        opts.name.forEach((name) => {
          cmd += `echo "${name}" && `;
          cmd += `/opt/apps/username-anarchy/username-anarchy ${opts.flagsUsernameAnarchy} ${name} >> /data/out.txt && `;
        });
        cmd += `true`;
        // Run
        await runInContainer({
          cmd: cmd,
          stdout: process.stdout,
          files: [{ local: fileName, remote: "/data/out.txt" }],
        });
      },
    );
}
