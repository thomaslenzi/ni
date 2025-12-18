import { Command, Option } from "commander";
import { runInContainer } from "../../lib/container";
import { createFileSync } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("generate passwords (psudohash + cupp)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output identifier").default(""))
    .addOption(
      new Option(
        "-k, --keyword <keywords...>",
        "keywords",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option("--flags-psudohash <flags>", "psudohash flags").default(""),
    )
    .addOption(new Option("--flags-cupp <flags>", "cupp flags").default(""))
    .action(
      async (opts: {
        id: string;
        keyword: string[];
        flagsPsudohash: string;
        flagsCupp: string;
      }) => {
        // Setup
        const [fileName] = createFileSync(
          "bruteforce",
          "passwords",
          opts.id || opts.keyword.join("-"),
        );
        // Command
        let cmd = `figlet "ni" && `;
        // Psudohash
        cmd += `figlet "psudohash" && `;
        cmd += `cd /opt/apps/psudohash && `;
        cmd += `./venv/bin/python3 psudohash.py -i -c -cpb -cpa -q -w ${opts.keyword.join(",")} -o /data/out.txt ${opts.flagsPsudohash} && `;
        // Cupp
        cmd += `figlet "cupp" && `;
        cmd += `cd /opt/apps/cupp && `;
        cmd += `python3 cupp.py -i -o /data/out.txt ${opts.flagsCupp}`;
        // Run
        await runInContainer({
          cmd: cmd,
          stdout: process.stdout,
          files: [{ local: fileName, remote: "/data/out.txt" }],
        });
      },
    );
}
