import { Argument, Command, Option } from "commander";
import * as he from "he";
import * as print from "../../lib/print";
import { tryCatchValue } from "../../lib/utils";

// Supported decoding formats
const supportedFormats = [
  "bin",
  "hex",
  "html",
  "html_full",
  "url",
  "base64",
  "unicode",
  "unicode_php",
] as const;

type SupportedFormat = (typeof supportedFormats)[number];

/**
 * Decode a string from various formats.
 * @param str String to decode.
 * @returns Array of tuples containing format and decoded string.
 */
function decodeString(str: string): [SupportedFormat, string][] {
  return [
    [
      "bin",
      tryCatchValue<string>(
        () =>
          str.replace(/([0-1]{1,8})/g, (_, c) =>
            String.fromCharCode(parseInt(c, 2)),
          ),
        "",
      ),
    ],
    [
      "hex",
      tryCatchValue<string>(
        () => Buffer.from(str, "hex").toString("utf-8"),
        "",
      ),
    ],
    ["html", tryCatchValue<string>(() => he.decode(str), "")],
    ["html_full", tryCatchValue<string>(() => he.decode(str), "")],
    ["url", tryCatchValue<string>(() => decodeURIComponent(str), "")],
    [
      "base64",
      tryCatchValue<string>(
        () => Buffer.from(str, "base64").toString("utf-8"),
        "",
      ),
    ],
    [
      "unicode",
      tryCatchValue<string>(
        () =>
          str.replace(/\\u([a-zA-Z0-9]{1,4})/g, (_, c) =>
            String.fromCharCode(parseInt(c, 16)),
          ),
        "",
      ),
    ],
    [
      "unicode_php",
      tryCatchValue<string>(
        () =>
          str.replace(/\\u\{([a-zA-Z0-9]{1,4})\}/g, (_, c) =>
            String.fromCharCode(parseInt(c, 16)),
          ),
        "",
      ),
    ],
  ];
}

export function register(cli: Command) {
  cli
    .description("decode a string")
    .version("1.0.0", "-V")
    .addOption(new Option("-w, --waw", "waw/pretty mode").default(false))
    .addOption(
      new Option("-f, --format <format>", "format").choices(supportedFormats),
    )
    .addArgument(new Argument("<string>", "string"))
    .action((str: string, opts: { waw: boolean; format?: SupportedFormat }) => {
      // Decodings
      const decodings = decodeString(str).filter(
        ([key]) => !opts.format || key === opts.format,
      );
      // Display
      if (opts.waw) print.table(["Format", "Value"], decodings);
      else if (opts.format) print.ln(decodings.map(([, v]) => v).join("\n"));
      else print.ln(decodings.map(([a, v]) => `${a}:${v}`).join("\n"));
    });
}
