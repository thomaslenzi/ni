import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("detect web technology stack (FinalRecon + WhatWeb)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
FinalRecon: https://github.com/finalrecon/finalrecon
WhatWeb: https://github.com/urbanadventurer/WhatWeb`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-m, --mode <mode>", "detection mode")
        .choices(["passive", "aggressive", "mixed"])
        .default("mixed"),
    )
    .addOption(
      new Option("-u, --url <url>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-finalrecon <flags>", "FinalRecon flags"))
    .addOption(new Option("--flags-whatweb <flags>", "WhatWeb flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        url: string;
        mode: string;
        flagsFinalrecon?: string;
        flagsWhatweb?: string;
      }) => {
        // Setup
        const outputId = `web_stack_${opts.id || opts.url}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // Finalrecon
        cmd += `figlet "FinalRecon" \n`;
        cmd += `cd /opt/apps/finalrecon \n`;
        cmd += `./venv/bin/python3 finalrecon.py --headers --sslinfo --url "${safe(opts.url)}" ${opts.flagsFinalrecon || ""} \n`;
        // Whatweb
        cmd += `figlet "WhatWeb" \n`;
        cmd += `whatweb -v --user-agent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36' ${opts.flagsWhatweb || ""}`;
        if (opts.mode)
          cmd += ` --aggression ${opts.mode === "passive" ? "1" : opts.mode === "aggressive" ? "4" : "3"}`;
        cmd += ` "${safe(opts.url)}"`;
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
