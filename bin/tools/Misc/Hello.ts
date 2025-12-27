import { Command, Option } from "commander";
import * as print from "../../lib/print";

export function register(cli: Command) {
  cli
    .description("say hello")
    .addOption(
      new Option("-n, --name <name>", "Name to greet").default("world"),
    )
    .action((opts: { name: string }) => {
      print.ln(`hello, ${opts.name}`);
    });
}
