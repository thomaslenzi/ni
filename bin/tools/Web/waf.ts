import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("detect web application firewall (wafw00f + whatwaf)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-t, --target <target>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-wafw00f <flags>", "wafw00f flags"))
    .addOption(new Option("--flags-whatwaf <flags>", "whatwaf flags"))
    .action(
      async (opts: {
        id: string;
        ai: boolean;
        target: string;
        flagsWafw00f: string;
        flagsWhatwaf: string;
      }) => {
        // Setup
        const [, file] = createFileStream("web", "waf", opts.id || opts.target);
        // Command
        let cmd = `figlet "ni" \n`;
        // wafwoof
        cmd += `figlet "wafw00f" \n`;
        cmd += `wafw00f -a -v ${opts.flagsWafw00f || ""} "${safe(opts.target)}" \n`;
        // WhatWaf
        cmd += `figlet "whatwaf" \n`;
        cmd += `cd /opt/apps/whatwaf \n`;
        cmd += `./venv/bin/python3 whatwaf --url "${safe(opts.target)}" --ra ${opts.flagsWhatwaf || ""}`;
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
