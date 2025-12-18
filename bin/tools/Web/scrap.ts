import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("scrap a web application (scrapy)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output identifier").default(""))
    .addOption(new Option("--ai", "generate AI report").default(false))
    .addOption(
      new Option("-t, --target <target>", "target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-scrapy <flags>", "scrapy flags").default(""))
    .action(
      async (opts: {
        id: string;
        ai: boolean;
        target: string;
        flagsScrapy: string;
      }) => {
        // Setup
        const [, file] = createFileStream(
          "web",
          "scrap",
          opts.id || opts.target,
        );
        // Command
        let cmd = `figlet "ni" && `;
        // Scrapy
        cmd += `figlet "scrapy" && `;
        cmd += `cd /opt/apps/scrapy && `;
        cmd += `./venv/bin/python3 ReconSpider.py ${opts.flagsScrapy} ${opts.target}`;
        // Run
        const data = await runInContainer({
          cmd: cmd,
          stdout: process.stdout,
          fsout: file,
        });
        // AI
        if (opts.ai)
          await writeAIReport({ data, stdout: process.stdout, fsout: file });
      },
    );
}
