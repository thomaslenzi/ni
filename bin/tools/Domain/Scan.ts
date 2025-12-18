import { Command, Option } from "commander";
import { existsSync } from "fs";
import { writeAIReport } from "../../lib/ai";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("scan domains (httpx + subzy + nuclei)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output identifier").default(""))
    .addOption(new Option("--ai", "generate AI report").default(false))
    .addOption(
      new Option(
        "-t, --target <target>",
        "target domain or targets file",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("--flags-httpx <flags>", "httpx flags").default(""))
    .addOption(new Option("--flags-subzy <flags>", "subzy flags").default(""))
    .addOption(new Option("--flags-nuclei <flags>", "nuclei flags").default(""))
    .action(
      async (opts: {
        id: string;
        ai: boolean;
        target: string;
        flagsHttpx: string;
        flagsSubzy: string;
        flagsNuclei: string;
      }) => {
        // Setup
        const [, file] = createFileStream(
          "domain",
          "scan",
          opts.id || opts.target,
        );
        // Command
        let cmd = `figlet "ni" && `;
        const files = [];
        // Setup files
        if (existsSync(opts.target))
          files.push({ local: opts.target, remote: "/data/targets.txt" });
        else cmd += `echo "${opts.target}" > /data/targets.txt && `;
        // httpx
        cmd += `figlet "httpx" && `;
        cmd += `cat /data/targets.txt | httpx-toolkit -status-code -title -server -td -ip -cname ${opts.flagsHttpx} && `;
        // subzy
        cmd += `figlet "subzy" && `;
        cmd += `/root/go/bin/subzy run --targets /data/targets.txt ${opts.flagsSubzy} && `;
        // nuclei
        cmd += `figlet "nuclei" && `;
        cmd += `nuclei -l /data/targets.txt ${opts.flagsNuclei}`;
        // Run
        const data = await runInContainer({
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
