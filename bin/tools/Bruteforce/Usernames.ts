import { Command, Option } from "commander";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileSync } from "../../lib/files";
import { throwError } from "../../lib/utils";

export function register(cli: Command) {
  cli
    .description("generate a usernames list (username-anarchy)")
    .addHelpText(
      "afterAll",
      `\nTools: 
username-anarchy: https://github.com/urbanadventurer/username-anarchy`,
    )
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(
      new Option(
        "-n, --name <first|first last|first middle last...>",
        "* name(s)",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option("--flags-username-anarchy <flags>", "username-anarchy flags"),
    )
    .action(
      async (opts: {
        id?: string;
        name: string[];
        flagsUsernameAnarchy?: string;
      }) => {
        // Parse args
        const names = opts.name.map((name) => {
          const parts = name.split(/\s+/);
          if (parts.length > 3)
            throwError(
              "error: required option '-n, --name <names...>' has to many words ([first|first last|first middle last])",
            );
          return parts;
        });
        // Setup
        const outputId = `bruteforce_usernames_${opts.id || names.flat().join("-")}`;
        const [filePath] = createFileSync(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // Username-Anarchy
        cmd += `figlet "username-anarchy" \n`;
        names.forEach((parts) => {
          const safeName = parts.map((part) => `"${safe(part)}"`).join(" ");
          cmd += `/opt/apps/username-anarchy/username-anarchy ${opts.flagsUsernameAnarchy || ""} ${safeName} >> /data/out.txt \n`;
        });
        // Run
        await runInContainer({
          outputId,
          cmd: cmd,
          stdout: process.stdout,
          files: [{ local: filePath, remote: "/data/out.txt" }],
        });
      },
    );
}
