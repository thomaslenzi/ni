import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run xss attack (XSStrike)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-t, --target <target>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-xsstrike <flags>", "XSStrike flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        target: string;
        flagsXsstrike?: string;
      }) => {
        // Setup
        const [, file] = createFileStream("web", "xss", opts.id || opts.target);
        // Command
        let cmd = `figlet "ni" \n`;
        // XSStrike
        cmd += `figlet "xsstrike" \n`;
        cmd += `cd /opt/apps/XSStrike/ \n`;
        cmd += `./venv/bin/python3 xsstrike.py ${opts.flagsXsstrike || ""} "${safe(opts.target)}"`;
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
