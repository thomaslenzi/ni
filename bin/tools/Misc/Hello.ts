import { Command } from "commander";
import * as print from "../../lib/print";

export function register(cli: Command) {
  cli
    .description("say hello")
    .option("-n, --name <name>", "Name to greet", "world")
    .action((opts: { name: string }) => {
      print.ln(`hello, ${opts.name}`);
    });
}
