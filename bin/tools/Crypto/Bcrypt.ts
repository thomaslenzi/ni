import bcrypt from "bcrypt";
import chalk from "chalk";
import { Argument, Command, Option } from "commander";
import { argPInt } from "../../lib/args";
import * as print from "../../lib/print";

export function register(cli: Command) {
  cli
    .description("manipulate bcrypt hashes")
    .version("1.0.0", "-V")
    .addOption(new Option("-w, --waw", "waw/pretty mode").default(false))
    .addOption(
      new Option("-c, --check", "check string against hash").default(false),
    )
    .addOption(
      new Option("-R, --rounds <rounds>", "rounds")
        .default(10)
        .argParser(argPInt),
    )
    .addOption(new Option("-h, --hash <hash>", "hash").default(""))
    .addArgument(new Argument("<string>", "string"))
    .action(
      async (
        str: string,
        opts: { waw: boolean; check: boolean; rounds: number; hash: string },
      ) => {
        // Check
        if (opts.check) {
          // Check
          const result = await bcrypt.compare(str, opts.hash);
          // Display
          if (opts.waw)
            print.ln(result ? chalk.bgGreen("MATCH") : chalk.bgRed("NO MATCH"));
          else print.ln(result ? "1" : "0");
          // Hash
        } else {
          // Hash
          const result = await bcrypt.hash(str, opts.rounds);
          // Display
          print.ln(result);
        }
      },
    );
}
