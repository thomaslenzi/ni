import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("scan graphql endpoint (graphw00f + graphql-cop + graphqlmap)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output identifier").default(""))
    .addOption(new Option("--ai", "generate AI report").default(false))
    .addOption(
      new Option("-t, --target <target>", "target url").makeOptionMandatory(),
    )
    .addOption(
      new Option("--flags-graphw00f <flags>", "graphw00f flags").default(""),
    )
    .addOption(
      new Option("--flags-graphql-cop <flags>", "graphql-cop flags").default(
        "",
      ),
    )
    .addOption(
      new Option("--flags-graphqlmap <flags>", "graphqlmap flags").default(""),
    )
    .action(
      async (opts: {
        id: string;
        ai: boolean;
        target: string;
        flagsGraphw00f: string;
        flagsGraphqlCop: string;
        flagsGraphqlmap: string;
      }) => {
        // Setup
        const [, file] = createFileStream(
          "web",
          "graphql",
          opts.id || opts.target,
        );
        // Command
        let cmd = `figlet "ni" && `;
        // Graphw00f
        cmd += `figlet "graphw00f" && `;
        cmd += `cd /opt/apps/graphw00f/ && `;
        cmd += `./venv/bin/python3 main.py -f -d -t ${opts.target} ${opts.flagsGraphw00f} && `;
        // Graphql-cop
        cmd += `figlet "graphql-cop" && `;
        cmd += `cd /opt/apps/graphql-cop/ && `;
        cmd += `./venv/bin/python3 graphql-cop.py -t ${opts.target} ${opts.flagsGraphqlCop} && `;
        // Graphqlmap
        cmd += `figlet "graphqlmap" && `;
        cmd += `cd /opt/apps/GraphQLmap/ && `;
        cmd += `./venv/bin/python3 ./bin/graphqlmap -u ${opts.target} ${opts.flagsGraphqlmap}`;
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
