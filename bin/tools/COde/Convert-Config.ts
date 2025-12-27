import { Argument, Command, Option } from "commander";
import * as toml from "smol-toml";
import * as yaml from "yaml";
import * as print from "../../lib/print";
import { throwError, tryCatchValue } from "../../lib/utils";

// Supported output types
const supportedFormats = ["json", "yaml", "toml"] as const;

type SupportedFormat = (typeof supportedFormats)[number];

export function register(cli: Command) {
  cli
    .description("convert configuration file")
    .version("1.0.0", "-V")
    .addOption(
      new Option("-f, --format <format>", "* output format")
        .choices(supportedFormats)
        .makeOptionMandatory(),
    )
    .addArgument(new Argument("<code>", "code"))
    .action((code: string, opts: { format: SupportedFormat }) => {
      // Detect input format
      let obj = null;
      if (!obj) obj = tryCatchValue<any>(() => JSON.parse(code), null);
      if (!obj) obj = tryCatchValue<any>(() => yaml.parse(code), null);
      if (!obj) obj = tryCatchValue<any>(() => toml.parse(code), null);
      // Validate input format
      if (!obj) throwError("error: could not detect config format.");
      // To output format
      let output = "";
      if (opts.format === "json") output = JSON.stringify(obj, null, 2);
      else if (opts.format === "yaml") output = yaml.stringify(obj);
      else if (opts.format === "toml") output = toml.stringify(obj);
      // Display
      print.highlighted(output, opts.format);
    });
}
