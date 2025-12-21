import { Command, Option } from "commander";
import { existsSync } from "fs";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("scan domains (httpx + subzy + nuclei)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
httpx: https://github.com/projectdiscovery/httpx
subzy: https://github.com/PentestPad/subzy
nuclei: https://github.com/projectdiscovery/nuclei`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option(
        "-t, --target <target>",
        "* target domain or targets file",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("--flags-httpx <flags>", "httpx flags"))
    .addOption(new Option("--flags-subzy <flags>", "subzy flags"))
    .addOption(new Option("--flags-nuclei <flags>", "nuclei flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        target: string;
        flagsHttpx?: string;
        flagsSubzy?: string;
        flagsNuclei?: string;
      }) => {
        // Setup
        const outputId = `domain_scan_${opts.id || opts.target}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        const files: { local: string; remote: string }[] = [];
        // Setup files
        if (existsSync(opts.target))
          files.push({ local: opts.target, remote: "/data/targets.txt" });
        else cmd += `echo "${safe(opts.target)}" > /data/targets.txt \n`;
        // httpx
        cmd += `figlet "httpx" \n`;
        cmd += `cat /data/targets.txt | httpx-toolkit ${opts.flagsHttpx || ""} -status-code -title -server -td -ip -cname \n`;
        // subzy
        cmd += `figlet "subzy" \n`;
        cmd += `/root/go/bin/subzy run ${opts.flagsSubzy || ""} --targets /data/targets.txt \n`;
        // nuclei
        cmd += `figlet "nuclei" \n`;
        cmd += `nuclei ${opts.flagsNuclei || ""} -l /data/targets.txt`;
        // Run
        const data = await runInContainer({
          outputId,
          cmd: cmd,
          stdout: process.stdout,
          fsout: file,
          files,
        });
        // AI
        if (opts.ai)
          await writeAIReport({ data, stdout: process.stdout, fsout: file });
      },
    );
}
