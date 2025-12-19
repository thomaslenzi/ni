import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("detect web technology stack (finalrecon + whatweb)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-m, --mode <mode>", "detection mode")
        .choices(["passive", "aggressive", "mixed"])
        .default("mixed"),
    )
    .addOption(
      new Option("-t, --target <target>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-finalrecon <flags>", "finalrecon flags"))
    .addOption(new Option("--flags-whatweb <flags>", "whatweb flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        target: string;
        mode: string;
        flagsFinalrecon?: string;
        flagsWhatweb?: string;
      }) => {
        // Setup
        const [, file] = createFileStream(
          "web",
          "stack",
          opts.id || opts.target,
        );
        // Command
        let cmd = `figlet "ni" \n`;
        // Finalrecon
        cmd += `figlet "finalrecon" \n`;
        cmd += `finalrecon --headers --sslinfo --url "${safe(opts.target)}" ${opts.flagsFinalrecon || ""} \n`;
        // Whatweb
        cmd += `figlet "whatweb" \n`;
        cmd += `whatweb -v --user-agent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36' ${opts.flagsWhatweb || ""}`;
        if (opts.mode)
          cmd += ` --aggression ${opts.mode === "passive" ? "1" : opts.mode === "aggressive" ? "4" : "3"}`;
        cmd += ` "${safe(opts.target)}"`;
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
