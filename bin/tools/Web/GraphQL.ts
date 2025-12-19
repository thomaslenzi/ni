import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("scan graphql endpoint (graphw00f + graphql-cop + graphqlmap)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-t, --target <target>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-graphw00f <flags>", "graphw00f flags"))
    .addOption(new Option("--flags-graphql-cop <flags>", "graphql-cop flags"))
    .addOption(new Option("--flags-graphqlmap <flags>", "graphqlmap flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        target: string;
        flagsGraphw00f?: string;
        flagsGraphqlCop?: string;
        flagsGraphqlmap?: string;
      }) => {
        // Setup
        const [, file] = createFileStream(
          "web",
          "graphql",
          opts.id || opts.target,
        );
        // Command
        let cmd = `figlet "ni" \n`;
        // Graphw00f
        cmd += `figlet "graphw00f" \n`;
        cmd += `cd /opt/apps/graphw00f/ \n`;
        cmd += `./venv/bin/python3 main.py -f -d -t "${safe(opts.target)}" ${opts.flagsGraphw00f || ""} \n`;
        // Graphql-cop
        cmd += `figlet "graphql-cop" \n`;
        cmd += `cd /opt/apps/graphql-cop/ \n`;
        cmd += `./venv/bin/python3 graphql-cop.py -t "${safe(opts.target)}" ${opts.flagsGraphqlCop || ""} \n`;
        // Graphqlmap
        cmd += `figlet "graphqlmap" \n`;
        cmd += `cd /opt/apps/GraphQLmap/ \n`;
        cmd += `./venv/bin/python3 ./bin/graphqlmap -u "${safe(opts.target)}" ${opts.flagsGraphqlmap || ""}`;
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
