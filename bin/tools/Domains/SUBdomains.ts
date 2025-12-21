import { Command, Option } from "commander";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileSync } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("find subdomains (crt.sh + subfinder + assetfinder + ffuf)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
subfinder: https://github.com/projectdiscovery/subfinder
assetfinder: https://github.com/tomnomnom/assetfinder
ffuf: https://github.com/ffuf/ffuf`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(
      new Option(
        "-t, --target <target>",
        "* target domain",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option("-m, --module <modules...>", "* modules")
        .choices(["crt", "subfinder", "assetfinder", "ffuf"])
        .default(["crt", "subfinder", "assetfinder"])
        .makeOptionMandatory(),
    )
    .addOption(new Option("--flags-subfinder <flags>", "subfinder flags"))
    .addOption(new Option("--flags-assetfinder <flags>", "assetfinder flags"))
    .addOption(new Option("--flags-ffuf <flags>", "ffuf flags"))
    .action(
      async (opts: {
        id?: string;
        target: string;
        module: string[];
        flagsSubfinder?: string;
        flagsAssetfinder?: string;
        flagsFfuf?: string;
      }) => {
        // Setup
        const outputId = `domains_subdomains_${opts.id || opts.target}`;
        const [filePath] = createFileSync(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // Crt
        if (opts.module.includes("crt")) {
          cmd += `figlet "crt.sh" \n`;
          cmd += `curl -s "https://crt.sh/?q=${safe(opts.target)}&output=json" | jq -r '.[].name_value' >> /data/out.txt \n`;
        }
        // Subfinder
        if (opts.module.includes("subfinder")) {
          cmd += `figlet "subfinder" \n`;
          cmd += `subfinder ${opts.flagsSubfinder || ""} -d "${safe(opts.target)}" -all -output /data/out.txt \n`;
        }
        // Assetfinder
        if (opts.module.includes("assetfinder")) {
          cmd += `figlet "assetfinder" \n`;
          cmd += `assetfinder ${opts.flagsAssetfinder || ""} "${safe(opts.target)}" >> /data/out.txt \n`;
        }
        // Ffuf
        if (opts.module.includes("ffuf")) {
          cmd += `figlet "ffuf" \n`;
          cmd += `ffuf ${opts.flagsFfuf || ""} -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ -u "https://FUZZ.${safe(opts.target)}" -o /data/out.txt \n`;
          cmd += `sed -i "/.${safe(opts.target)}$/ ! s/$/.${safe(opts.target)}/" /data/out.txt \n`;
        }
        // Sort
        cmd += `figlet "sort" \n`;
        cmd += `sort -u -o /data/out.txt /data/out.txt`;
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
