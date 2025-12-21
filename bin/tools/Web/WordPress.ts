import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run wordpress scan (WPScan)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
WPScan: https://github.com/wpscanteam/wpscan`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-u, --url <url>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-wpscan <flags>", "WPScan flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        url: string;
        flagsWpscan?: string;
      }) => {
        // Setup
        const outputId = `web_wordpress_${opts.id || opts.url}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // WPScan
        cmd += `figlet "WPScan" \n`;
        cmd += `wpscan --random-user-agent ${opts.flagsWpscan || ""} --url "${safe(opts.url)}"`;
        if (process.env.WPSCAN_API_TOKEN)
          cmd += ` --api-token ${process.env.WPSCAN_API_TOKEN}`;
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
