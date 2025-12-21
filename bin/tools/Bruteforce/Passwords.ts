import { Command, Option } from "commander";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileSync } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("generate a passwords list (psudohash + CUPP)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
psudohash: https://github.com/t3l3machus/psudohash
CUPP: https://github.com/Mebus/cupp`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(
      new Option(
        "-k, --keyword <keyword...>",
        "* keyword(s)",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("--flags-psudohash <flags>", "psudohash flags"))
    .addOption(new Option("--flags-cupp <flags>", "CUPP flags"))
    .action(
      async (opts: {
        id?: string;
        keyword: string[];
        flagsPsudohash?: string;
        flagsCupp?: string;
      }) => {
        // Setup
        const outputId = `bruteforce_passwords_${opts.id || opts.keyword.join("-")}`;
        const [filePath] = createFileSync(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // Psudohash
        cmd += `figlet "psudohash" \n`;
        cmd += `cd /opt/apps/psudohash \n`;
        cmd += `./venv/bin/python3 psudohash.py ${opts.flagsPsudohash || ""} -i -c -cpb -cpa -q -w "${opts.keyword.map(safe).join(",")}" -o /data/out.txt \n`;
        // CUPP
        cmd += `figlet "CUPP" \n`;
        cmd += `cd /opt/apps/cupp \n`;
        cmd += `python3 cupp.py ${opts.flagsCupp || ""} -i -o /data/out.txt`;
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
