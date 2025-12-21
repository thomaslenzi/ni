import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run xss attack (XSStrike)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
XSStrike: https://github.com/s0md3v/XSStrike`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-u, --url <url>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("-H, --header <header...>", "HTTP header(s)"))
    .addOption(new Option("-d, --data <data>", "HTTP POST data"))
    .addOption(new Option("--json", "flag data as JSON"))
    .addOption(new Option("--flags-xsstrike <flags>", "XSStrike flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        url: string;
        header?: string[];
        data?: string;
        json?: boolean;
        flagsXsstrike?: string;
      }) => {
        // Setup
        const outputId = `web_xss_${opts.id || opts.url}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // XSStrike
        cmd += `figlet "XSStrike" \n`;
        cmd += `cd /opt/apps/XSStrike/ \n`;
        cmd += `./venv/bin/python3 xsstrike.py ${opts.flagsXsstrike || ""} -u "${safe(opts.url)}" --crawl  --blind -t 4 --skip`;
        if (opts.header) cmd += ` --headers "${safe(opts.header.join("\\n"))}"`;
        if (opts.data) cmd += ` --data "${safe(opts.data)}"`;
        if (opts.json) cmd += ` --json`;
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
