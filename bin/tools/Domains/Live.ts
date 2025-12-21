import { Command, Option } from "commander";
import { existsSync } from "fs";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileSync } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("filter live domains (httpx)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
httpx: https://github.com/projectdiscovery/httpx`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(
      new Option(
        "-t, --target <target>",
        "* target domain or targets file",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("--flags-httpx <flags>", "httpx flags"))
    .action(
      async (opts: { id?: string; target: string; flagsHttpx?: string }) => {
        // Setup
        const outputId = `domains_filter_${opts.id || opts.target}`;
        const [filePath] = createFileSync(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        const files: { local: string; remote: string }[] = [];
        // Setup files
        if (existsSync(opts.target))
          files.push({ local: opts.target, remote: "/data/targets.txt" });
        else cmd += `echo "${safe(opts.target)}" > /data/targets.txt \n`;
        // httpx
        cmd += `figlet "httpx" \n`;
        cmd += `cat /data/targets.txt | httpx-toolkit ${opts.flagsHttpx || ""} -o /data/out.txt\n`;
        // Run
        await runInContainer({
          outputId,
          cmd: cmd,
          stdout: process.stdout,
          files: [...files, { local: filePath, remote: "/data/out.txt" }],
        });
      },
    );
}
