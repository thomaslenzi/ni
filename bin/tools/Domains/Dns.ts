import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("find DNS records (whois + dig + FinalRecon + dnsenum)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
FinalRecon: https://github.com/thewhiteh4t/FinalRecon 
dnsenum: https://github.com/fwaeytens/dnsenum`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option(
        "-t, --target <target>",
        "* target domain",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("--flags-whois <flags>", "whois flags"))
    .addOption(new Option("--flags-dig <flags>", "dig flags"))
    .addOption(new Option("--flags-finalrecon <flags>", "FinalRecon flags"))
    .addOption(new Option("--flags-dnsenum <flags>", "dnsenum flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        target: string;
        flagsWhois?: string;
        flagsDig?: string;
        flagsFinalrecon?: string;
        flagsDnsenum?: string;
      }) => {
        // Setup
        const outputId = `domains_dns_${opts.id || opts.target}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // Whois
        cmd += `figlet "whois" \n`;
        cmd += `whois ${opts.flagsWhois || ""} "${safe(opts.target)}" \n`;
        // Dig
        cmd += `figlet "dig" \n`;
        cmd += `dig ${opts.flagsDig || ""} "${safe(opts.target)}" ANY \n`;
        // FinalRecon
        cmd += `figlet "FinalRecon" \n`;
        cmd += `finalrecon ${opts.flagsFinalrecon || ""} -nb --dns --url "http://${safe(opts.target)}" \n`;
        // DNSenum
        cmd += `figlet "dnsenum" \n`;
        cmd += `dnsenum ${opts.flagsDnsenum || ""} --noreverse --nocolor "${safe(opts.target)}"`;
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
