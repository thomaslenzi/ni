import { Command, Option } from "commander";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("scan graphql target (graphw00f + GraphQL Cop + GraphQLmap)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
graphw00f: https://github.com/dolevf/graphw00f
GraphQL Cop: https://github.com/dolevf/graphql-cop
GraphQLmap: https://github.com/swisskyrepo/GraphQLmap`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-u, --url <url>", "* target url").makeOptionMandatory(),
    )
    .addOption(new Option("--flags-graphw00f <flags>", "graphw00f flags"))
    .addOption(new Option("--flags-graphql-cop <flags>", "GraphQL Cop flags"))
    .addOption(new Option("--flags-graphqlmap <flags>", "GraphQLmap flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        url: string;
        flagsGraphw00f?: string;
        flagsGraphqlCop?: string;
        flagsGraphqlmap?: string;
      }) => {
        // Setup
        const outputId = `web_graphql_${opts.id || opts.url}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        // Graphw00f
        cmd += `figlet "graphw00f" \n`;
        cmd += `cd /opt/apps/graphw00f/ \n`;
        cmd += `./venv/bin/python3 main.py -f -d -t "${safe(opts.url)}" ${opts.flagsGraphw00f || ""} \n`;
        // GraphQL Cop
        cmd += `figlet "GraphQL Cop" \n`;
        cmd += `cd /opt/apps/graphql-cop/ \n`;
        cmd += `./venv/bin/python3 graphql-cop.py -t "${safe(opts.url)}" ${opts.flagsGraphqlCop || ""} \n`;
        // GraphQLmap
        cmd += `figlet "GraphQLmap" \n`;
        cmd += `cd /opt/apps/GraphQLmap/ \n`;
        cmd += `./venv/bin/python3 ./bin/graphqlmap -u "${safe(opts.url)}" ${opts.flagsGraphqlmap || ""}`;
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
