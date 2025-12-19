import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run wordpress scan (wpscan)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-t, --target <target>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-wpscan <flags>", "wpscan flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        target: string;
        flagsWpscan?: string;
      }) => {
        // Setup
        const [, file] = createFileStream(
          "web",
          "wordpress",
          opts.id || opts.target,
        );
        // Command
        let cmd = `figlet "ni" \n`;
        // WPScan
        cmd += `figlet "wpscan" \n`;
        cmd += `wpscan --random-user-agent --format cli-no-colour ${opts.flagsWpscan || ""}`;
        if (process.env.WPSCAN_API_TOKEN)
          cmd += ` --api-token ${process.env.WPSCAN_API_TOKEN}`;
        cmd += ` --url "${safe(opts.target)}"`;
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
