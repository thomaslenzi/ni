import { Argument, Command, Option } from "commander";
import { createHash } from "crypto";
import * as print from "../../lib/print";

// Supported algorithms
const supportedAlgorithms = [
  "md5",
  "sha1",
  "sha256",
  "sha224",
  "sha512",
  "sha384",
  "sha3",
  "ripemd160",
] as const;

type SupportedAlgorithm = (typeof supportedAlgorithms)[number];

// Supported encodings
const supportedEncodings = ["bin", "hex", "base64"] as const;

type SupportedEncoding = (typeof supportedEncodings)[number];

/**
 * Hash a string using various algorithms.
 * @param str String to hash.
 * @param encoding Encoding type.
 * @returns Array of tuples containing algorithm and hashed string.
 */
function hashString(
  str: string,
  encoding: SupportedEncoding,
): [SupportedAlgorithm, string][] {
  // Digest
  function digestToString(digest: Buffer): string {
    if (encoding === "bin")
      return digest
        .toString("utf-8")
        .split("")
        .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
        .join("");
    if (encoding === "hex") return digest.toString("hex");
    if (encoding === "base64") return digest.toString("base64");
    return digest.toString("utf-8");
  }
  // Hashes
  return [
    ["md5", digestToString(createHash("md5").update(str).digest())],
    ["sha1", digestToString(createHash("sha1").update(str).digest())],
    ["sha256", digestToString(createHash("sha256").update(str).digest())],
    ["sha224", digestToString(createHash("sha224").update(str).digest())],
    ["sha512", digestToString(createHash("sha512").update(str).digest())],
    ["sha384", digestToString(createHash("sha384").update(str).digest())],
    ["sha3", digestToString(createHash("sha3-512").update(str).digest())],
    ["ripemd160", digestToString(createHash("ripemd160").update(str).digest())],
  ];
}

export function register(cli: Command) {
  cli
    .description("hash a string")
    .version("1.0.0", "-V")
    .addOption(new Option("-w, --waw", "waw/pretty mode"))
    .addOption(
      new Option("-a, --algorithm <algorithm>", "algorithm").choices(
        supportedAlgorithms,
      ),
    )
    .addOption(
      new Option("-e, --encoding <encoding>", "encoding")
        .choices(supportedEncodings)
        .default("hex"),
    )
    .addArgument(new Argument("<string>", "string"))
    .action(
      async (
        str: string,
        opts: {
          waw?: boolean;
          algorithm?: SupportedAlgorithm;
          encoding: SupportedEncoding;
        },
      ) => {
        // Hashes
        const hashes = hashString(str, opts.encoding).filter(
          ([key]) => !opts.algorithm || key === opts.algorithm,
        );
        // Display
        if (opts.waw) print.table(["Algorithm", "Hash"], hashes);
        else if (opts.algorithm) print.ln(hashes.map(([, v]) => v).join("\n"));
        else print.ln(hashes.map(([a, v]) => `${a}:${v}`).join("\n"));
      },
    );
}
