import { Command, Option } from "commander";
import { argPInt } from "../../lib/args";
import * as print from "../../lib/print";
import { throwError } from "../../lib/utils";

// Symbols string
const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
const numberChars = "0123456789";
const symbolChars = "!@#$%^&*()-_=+[]{}|;:,.<>?/";

export function register(cli: Command) {
  cli
    .description("generate tokens")
    .version("1.0.0", "-V")
    .addOption(new Option("-w, --waw", "waw/pretty mode"))
    .addOption(new Option("-l, --lowercase", "use lowercase"))
    .addOption(new Option("-u, --uppercase", "use uppercase"))
    .addOption(new Option("-n, --numbers", "use numbers"))
    .addOption(new Option("-s, --symbols", "use symbols"))
    .addOption(new Option("-i, --include <include>", "include characters"))
    .addOption(new Option("-e, --exclude <exclude>", "exclude characters"))
    .addOption(
      new Option("-L, --length <length>", "length")
        .default(32)
        .argParser(argPInt),
    )
    .addOption(
      new Option("-N, --number <n>", "number").default(10).argParser(argPInt),
    )
    .action(
      (opts: {
        waw?: boolean;
        lowercase?: boolean;
        uppercase?: boolean;
        numbers?: boolean;
        symbols?: boolean;
        include?: string;
        exclude?: string;
        length: number;
        number: number;
      }) => {
        // Args
        const all: boolean =
          !opts.lowercase &&
          !opts.uppercase &&
          !opts.numbers &&
          !opts.symbols &&
          !opts.include;
        // Allowed characters
        let allChars = opts.include || "";
        if (all || opts.uppercase) allChars += uppercaseChars;
        if (all || opts.lowercase) allChars += lowercaseChars;
        if (all || opts.numbers) allChars += numberChars;
        if (all || opts.symbols) allChars += symbolChars;
        allChars = allChars
          .split("")
          .filter((c, i, arr) => arr.indexOf(c) === i)
          .filter((c) => !(opts.exclude || "").includes(c))
          .join("");
        // Validate character set
        if (allChars.length === 0)
          throwError("error: the character set is empty.");
        // Tokens
        const tokens: string[] = [];
        for (let i = 0; i < opts.number; i++) {
          const token = Array.from(
            { length: opts.length },
            () => allChars[Math.floor(Math.random() * allChars.length)],
          ).join("");
          tokens.push(token);
        }
        // Display
        if (opts.waw)
          print.table(
            ["#", "Token"],
            tokens.map((token, i) => [`${i + 1}`, token]),
          );
        else print.ln(tokens.join("\n"));
      },
    );
}
