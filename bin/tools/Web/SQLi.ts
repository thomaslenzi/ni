import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run sqli attack (sqlmap)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-t, --target <target>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("-d, --data <data>", "POST data payload"))
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
        target: string;
        data?: string;
        enum?: string;
        dumpDatabase?: string;
        dumpTable?: string;
        shell?: boolean;
        fileRead?: string;
        flagsSqlmap?: string;
      }) => {
        // Setup
        const [, file] = createFileStream(
          "web",
          "sqli",
          opts.id || opts.target,
        );
        // Command
        let cmd = `figlet "ni" \n`;
        // SQLMap
        cmd += `figlet "sqlmap" \n`;
        cmd += `sqlmap ${opts.flagsSqlmap || ""} --random-agent --batch -f -u "${safe(opts.target)}"`;
        if (opts.data) cmd += ` --data="${safe(opts.data)}"`;
        if (opts.enum) cmd += ` --${opts.enum}`;
        if (opts.dumpDatabase || opts.dumpTable) cmd += ` --dump`;
        if (opts.dumpDatabase) cmd += ` -D "${safe(opts.dumpDatabase)}"`;
        if (opts.dumpTable) cmd += ` -T "${safe(opts.dumpTable)}"`;
        if (opts.shell) cmd += ` --os-shell`;
        if (opts.fileRead) cmd += ` --file-read=${opts.fileRead}`;
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
