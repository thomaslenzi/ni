import { Command, Option } from "commander";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileSync } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("generate a passwords list (psudohash + cupp)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(
      new Option(
        "-k, --keyword <keyword...>",
        "* keyword(s)",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("--flags-psudohash <flags>", "psudohash flags"))
    .addOption(new Option("--flags-cupp <flags>", "cupp flags"))
    .action(
      async (opts: {
        id?: string;
        keyword: string[];
        flagsPsudohash?: string;
        flagsCupp?: string;
      }) => {
        // Setup
        const [filePath] = createFileSync(
          "bruteforce",
          "passwords",
          opts.id || opts.keyword.join("-"),
        );
        // Command
        let cmd = `figlet "ni" \n`;
        // Psudohash
        cmd += `figlet "psudohash" \n`;
        cmd += `cd /opt/apps/psudohash \n`;
        cmd += `./venv/bin/python3 psudohash.py ${opts.flagsPsudohash || ""} -i -c -cpb -cpa -q -w "${opts.keyword.map(safe).join(",")}" -o /data/out.txt \n`;
        // Cupp
        cmd += `figlet "cupp" \n`;
        cmd += `cd /opt/apps/cupp \n`;
        cmd += `python3 cupp.py ${opts.flagsCupp || ""} -i -o /data/out.txt`;
        // Run
        await runInContainer({
          cmd: cmd,
          stdout: process.stdout,
          files: [{ local: filePath, remote: "/data/out.txt" }],
        });
      },
    );
}
