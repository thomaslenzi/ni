import { Command, Option } from "commander";
import { runInContainer } from "../../lib/container";
import { createFileSync } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("find subdomains (crt.sh + subfinder + assetfinder + ffuf)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output identifier").default(""))
    .addOption(
      new Option(
        "-t, --target <target>",
        "target domain",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option("-m, --module <modules...>", "modules")
        .choices(["crt", "subfinder", "assetfinder", "ffuf"])
        .default(["crt", "subfinder", "assetfinder"])
        .makeOptionMandatory(),
    )
    .addOption(
      new Option("--flags-subfinder <flags>", "subfinder flags").default(""),
    )
    .addOption(
      new Option("--flags-assetfinder <flags>", "assetfinder flags").default(
        "",
      ),
    )
    .addOption(new Option("--flags-ffuf <flags>", "ffuf flags").default(""))
    .action(
      async (opts: {
        id: string;
        target: string;
        module: string[];
        flagsSubfinder: string;
        flagsAssetfinder: string;
        flagsFfuf: string;
      }) => {
        // Setup
        const [fileName] = createFileSync(
          "domain",
          "subdomains",
          opts.id || opts.target,
        );
        // Command
        let cmd = `figlet "ni" && `;
        // Crt
        if (opts.module.includes("crt")) {
          cmd += `figlet "crt.sh" && `;
          cmd += `curl -s 'https://crt.sh/?q=${opts.target}&output=json' | jq -r '.[].name_value' >> /data/out.txt && `;
        }
        // Subfinder
        if (opts.module.includes("subfinder")) {
          cmd += `figlet "subfinder" && `;
          cmd += `subfinder -d ${opts.target} -all -output /data/out.txt ${opts.flagsSubfinder} && `;
        }
        // Assetfinder
        if (opts.module.includes("assetfinder")) {
          cmd += `figlet "assetfinder" && `;
          cmd += `assetfinder ${opts.flagsAssetfinder} ${opts.target} >> /data/out.txt && `;
        }
        // Ffuf
        if (opts.module.includes("ffuf")) {
          cmd += `figlet "ffuf" && `;
          cmd += `ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ -u https://FUZZ.${opts.target} -o /data/out.txt ${opts.flagsFfuf} && `;
          cmd += `sed -i '/.${opts.target}$/ ! s/$/.${opts.target}/' /data/out.txt && `;
        }
        // Sort
        cmd += `figlet "sort" && `;
        cmd += `sort -u -o /data/out.txt /data/out.txt`;
        // Run
        await runInContainer({
          cmd: cmd,
          stdout: process.stdout,
          files: [{ local: fileName, remote: "/data/out.txt" }],
        });
      },
    );
}
