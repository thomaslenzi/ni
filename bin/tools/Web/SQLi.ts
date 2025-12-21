import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run sqli attack (sqlmap)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
sqlmap: https://github.com/sqlmapproject/sqlmap`,
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
    .addOption(
      new Option("-e, --enum <enumerate>", "enumerate options").choices([
        "banner",
        "passwords",
        "current-user",
        "current-db",
        "is-dba",
        "schema",
      ]),
    )
    .addOption(new Option("--dump-database <database>", "dump database"))
    .addOption(new Option("--dump-table <table>", "dump table"))
    .addOption(new Option("--shell", "interactive shell"))
    .addOption(new Option("--file-read", "read file"))
    .addOption(new Option("--flags-sqlmap <flags>", "sqlmap flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        url: string;
        request: string;
        header?: string[];
        data?: string;
        json?: boolean;
        enum?: string;
        dumpDatabase?: string;
        dumpTable?: string;
        shell?: boolean;
        fileRead?: string;
        flagsSqlmap?: string;
      }) => {
        // Setup
        const outputId = `web_sqli_${opts.id || opts.url}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // SQLMap
        cmd += `figlet "sqlmap" \n`;
        cmd += `sqlmap ${opts.flagsSqlmap || ""} --random-agent --batch -f -u "${safe(opts.url)}"`;
        if (opts.request) cmd += ` --method="${safe(opts.request)}"`;
        if (opts.json) {
          opts.header = opts.header || [];
          opts.header.push("Content-Type: application/json;charset=utf-8");
        }
        if (opts.header) cmd += ` --headers "${safe(opts.header.join("\\n"))}"`;
        if (opts.data) cmd += ` --data="${safe(opts.data)}"`;
        if (opts.enum) cmd += ` --${opts.enum}`;
        if (opts.dumpDatabase || opts.dumpTable) cmd += ` --dump`;
        if (opts.dumpDatabase) cmd += ` -D "${safe(opts.dumpDatabase)}"`;
        if (opts.dumpTable) cmd += ` -T "${safe(opts.dumpTable)}"`;
        if (opts.shell) cmd += ` --os-shell`;
        if (opts.fileRead) cmd += ` --file-read=${opts.fileRead}`;
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
