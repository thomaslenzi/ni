import chalk from "chalk";
import { Argument, Command, Option } from "commander";
import { decode, sign, verify } from "jsonwebtoken";
import * as print from "../../lib/print";
import { throwError, tryCatchValue } from "../../lib/utils";

export function register(cli: Command) {
  cli
    .description("manipulate JWT tokens")
    .version("1.0.0", "-V")
    .addOption(new Option("-w, --waw", "waw/pretty mode").default(false))
    .addOption(new Option("-c, --check", "check signature").default(false))
    .addOption(new Option("-s, --sign", "sign token").default(false))
    .addOption(new Option("-k, --key <key>", "secret key").default(""))
    .addArgument(new Argument("<string>", "token or data"))
    .action(
      (
        str: string,
        opts: { waw: boolean; check: boolean; sign: boolean; key: string },
      ) => {
        // Check
        if (opts.check) {
          // Verify
          const valid = tryCatchValue<boolean>(
            () => !!verify(str, opts.key),
            false,
          );
          // Display
          if (opts.waw)
            print.ln(valid ? chalk.bgGreen("VALID") : chalk.bgRed("INVALID"));
          else print.ln(valid ? "1" : "0");
          // Sign
        } else if (opts.sign) {
          // Sign
          try {
            const d = JSON.parse(str);
            const token = sign(d.payload, opts.key, {
              algorithm: d.header.alg || "HS256",
            });
            // Data
            print.ln(token);
          } catch {
            throwError("error: incorrect data format.");
          }
          // Decode
        } else {
          const output = decode(str, { complete: true });
          // Validate token
          if (!output) throwError("error: invalid JWT token.");
          // Display
          print.highlighted(JSON.stringify(output, null, 2), "json");
        }
      },
    );
}
