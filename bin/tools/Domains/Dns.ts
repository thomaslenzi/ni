import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description(
      "find DNS records (whois + dig + dnsrecon + finalrecon + dnsenum)",
    )
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
whois: https://www.kali.org/tools/whois/
dig: https://www.kali.org/tools/bind9/#dig
dnsrecon: https://github.com/darkoperator/dnsrecon
finalrecon: https://github.com/thewhiteh4t/FinalRecon
dnsenum: https://github.com/SparrowOchon/dnsenum2`,
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
    .addOption(new Option("--flags-dnsrecon <flags>", "dnsrecon flags"))
    .addOption(new Option("--flags-finalrecon <flags>", "finalrecon flags"))
    .addOption(new Option("--flags-dnsenum <flags>", "dnsenum flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        target: string;
        flagsWhois?: string;
        flagsDig?: string;
        flagsDnsrecon?: string;
        flagsFinalrecon?: string;
        flagsDnsenum?: string;
      }) => {
        // Setup
        const outputId = `domains_dns_${opts.id || opts.target}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // whois
        cmd += `figlet "whois" \n`;
        cmd += `whois ${opts.flagsWhois || ""} "${safe(opts.target)}" \n`;
        // dig
        cmd += `figlet "dig" \n`;
        cmd += `dig ${opts.flagsDig || ""} "${safe(opts.target)}" ANY \n`;
        // dnsrecon
        cmd += `figlet "dnsrecon" \n`;
        cmd += `dnsrecon ${opts.flagsDnsrecon || ""} -d "${safe(opts.target)}" \n`;
        // finalrecon
        cmd += `figlet "finalrecon" \n`;
        cmd += `cd /opt/apps/finalrecon \n`;
        cmd += `./venv/bin/python3 finalrecon.py ${opts.flagsFinalrecon || ""} -nb --dns --url "http://${safe(opts.target)}" \n`;
        // dnsenum
        cmd += `figlet "dnsenum" \n`;
        cmd += `dnsenum ${opts.flagsDnsenum || ""} --noreverse --enum "${safe(opts.target)}" \n`;
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
