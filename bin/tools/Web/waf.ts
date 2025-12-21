import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("detect web application firewall (wafw00f + whatwaf)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
wafw00f: https://github.com/EnableSecurity/wafw00f
WhatWaf: https://github.com/Ekultek/WhatWaf`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-u, --url <url>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-wafw00f <flags>", "wafw00f flags"))
    .addOption(new Option("--flags-whatwaf <flags>", "WhatWaf flags"))
    .action(
      async (opts: {
        id: string;
        ai: boolean;
        url: string;
        flagsWafw00f: string;
        flagsWhatwaf: string;
      }) => {
        // Setup
        const outputId = `web_waf_${opts.id || opts.url}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // wafwoof
        cmd += `figlet "wafw00f" \n`;
        cmd += `wafw00f -a -v ${opts.flagsWafw00f || ""} "${safe(opts.url)}" \n`;
        // WhatWaf
        cmd += `figlet "WhatWaf" \n`;
        cmd += `cd /opt/apps/whatwaf \n`;
        cmd += `./venv/bin/python3 whatwaf --url "${safe(opts.url)}" --ra ${opts.flagsWhatwaf || ""}`;
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
