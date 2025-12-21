import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("scrap a web application (Scrapy)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
Scrapy: https://github.com/scrapy/scrapy`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-u, --url <url>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-scrapy <flags>", "Scrapy flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        url: string;
        flagsScrapy?: string;
      }) => {
        // Setup
        const outputId = `web_scrap_${opts.id || opts.url}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // Scrapy
        cmd += `figlet "Scrapy" \n`;
        cmd += `cd /opt/apps/scrapy \n`;
        cmd += `./venv/bin/python3 ReconSpider.py ${opts.flagsScrapy || ""} "${safe(opts.url)}"`;
        // Run
        const data = await runInContainer({
          outputId,
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
