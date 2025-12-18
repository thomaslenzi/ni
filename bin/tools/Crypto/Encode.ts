import { Argument, Command, Option } from "commander";
import * as he from "he";
import * as print from "../../lib/print";
import { tryCatchValue } from "../../lib/utils";

// Supported encoding/decoding formats
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
 * Encode a string into various formats.
 * @param str String to encode.
 * @returns Array of tuples containing format and encoded string.
 */
function encodeString(str: string): [SupportedFormat, string][] {
  return [
    [
      "bin",
      tryCatchValue<string>(
        () =>
          str
            .split("")
            .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
            .join(""),
        "",
      ),
    ],
    [
      "hex",
      tryCatchValue<string>(
        () => Buffer.from(str, "utf-8").toString("hex"),
        "",
      ),
    ],
    [
      "html",
      tryCatchValue<string>(
        () => he.encode(str, { useNamedReferences: true, decimal: true }),
        "",
      ),
    ],
    [
      "html_full",
      tryCatchValue<string>(
        () =>
          he.encode(str, {
            useNamedReferences: true,
            encodeEverything: true,
            decimal: true,
          }),
        "",
      ),
    ],
    ["url", tryCatchValue<string>(() => encodeURIComponent(str), "")],
    [
      "base64",
      tryCatchValue<string>(
        () => Buffer.from(str, "utf-8").toString("base64"),
        "",
      ),
    ],
    [
      "unicode",
      tryCatchValue<string>(
        () =>
          str
            .split("")
            .map((c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`)
            .join(""),
        "",
      ),
    ],
    [
      "unicode_php",
      tryCatchValue<string>(
        () =>
          str
            .split("")
            .map((c) => `\\u{${c.charCodeAt(0).toString(16).padStart(4, "0")}}`)
            .join(""),
        "",
      ),
    ],
  ];
}

export function register(cli: Command) {
  cli
    .description("encode a string")
    .version("1.0.0", "-V")
    .addOption(new Option("-w, --waw", "waw/pretty mode").default(false))
    .addOption(
      new Option("-f, --format <format>", "format").choices(supportedFormats),
    )
    .addArgument(new Argument("<string>", "string"))
    .action((str: string, opts: { waw: boolean; format?: SupportedFormat }) => {
      // Encodinds
      const encodings = encodeString(str).filter(
        ([key]) => !opts.format || key === opts.format,
      );
      // Display
      if (opts.waw) print.table(["Format", "Value"], encodings);
      else if (opts.format) print.ln(encodings.map(([, v]) => v).join("\n"));
      else print.ln(encodings.map(([a, v]) => `${a}:${v}`).join("\n"));
    });
}
