import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("detect web application firewall (wafw00f + whatwaf)")
    .version("1.0.0", "-V")
    .addOption(new Option("--ai", "generate AI report").default(false))
    .addOption(
      new Option("-t, --target <target>", "target url").makeOptionMandatory(),
    )
    .addOption(
      new Option("--flags-wafw00f <flags>", "wafw00f flags").default(""),
    )
    .addOption(
      new Option("--flags-whatwaf <flags>", "whatwaf flags").default(""),
    )
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
        let cmd = `figlet "ni" && `;
        // wafwoof
        cmd += `figlet "wafw00f" && `;
        cmd += `wafw00f -a -v ${opts.flagsWafw00f} ${opts.target} && `;
        // WhatWaf
        cmd += `figlet "whatwaf" && `;
        cmd += `cd /opt/apps/whatwaf && `;
        cmd += `./venv/bin/python3 whatwaf --url ${opts.target} --ra ${opts.flagsWhatwaf}`;
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
