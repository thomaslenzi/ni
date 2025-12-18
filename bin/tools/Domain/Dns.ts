import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("find DNS records (whois + dig + finalrecon + dnsenum)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output identifier").default(""))
    .addOption(new Option("--ai", "generate AI report").default(false))
    .addOption(
      new Option(
        "-t, --target <target>",
        "target domain",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("--flags-whois <flags>", "whois flags").default(""))
    .addOption(new Option("--flags-dig <flags>", "dig flags").default(""))
    .addOption(
      new Option("--flags-finalrecon <flags>", "finalrecon flags").default(""),
    )
    .addOption(
      new Option("--flags-dnsenum <flags>", "dnsenum flags").default(""),
    )
    .action(
      async (opts: {
        id: string;
        ai: boolean;
        target: string;
        flagsWhois: string;
        flagsDig: string;
        flagsFinalrecon: string;
        flagsDnsenum: string;
      }) => {
        // Setup
        const [, file] = createFileStream(
          "domain",
          "dns",
          opts.id || opts.target,
        );
        // Command
        let cmd = `figlet "ni" && `;
        // Whois
        cmd += `figlet "whois" && `;
        cmd += `whois ${opts.flagsWhois} ${opts.target} && `;
        // Dig
        cmd += `figlet "dig" && `;
        cmd += `dig ${opts.flagsDig} ${opts.target} ANY && `;
        // FinalRecon
        cmd += `figlet "finalrecon" && `;
        cmd += `finalrecon -nb --dns --url http://${opts.target} ${opts.flagsFinalrecon} && `;
        // DNSenum
        cmd += `figlet "dnsenum" && `;
        cmd += `dnsenum --noreverse --nocolor ${opts.flagsDnsenum} ${opts.target}`;
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
