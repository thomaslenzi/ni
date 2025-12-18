import { Argument, Command } from "commander";
import { format } from "prettier";
import * as print from "../../lib/print";
import { throwError } from "../../lib/utils";

// Supported languages
// eslint-disable-next-line prettier/prettier
const supportedLanguages = ["typescript", "javascript", "php", "python", "java", "ruby", "rust", "nginx", "json", "yaml", "toml", "xml", "sh", "sql", "graphql", "html", "markdown", "mdx", "css", "scss", "less"] as const;

type SupportedLanguage = (typeof supportedLanguages)[number];

// Parsers map
const parserMap: Record<SupportedLanguage, string> = {
  typescript: "typescript",
  javascript: "babel",
  php: "php",
  python: "python",
  java: "java",
  ruby: "ruby",
  rust: "rust",
  nginx: "nginx",
  json: "json",
  yaml: "yaml",
  toml: "toml",
  xml: "xml",
  sh: "sh",
  sql: "sql",
  graphql: "graphql",
  html: "html",
  markdown: "markdown",
  mdx: "mdx",
  css: "css",
  scss: "scss",
  less: "less",
};

export function register(cli: Command) {
  cli
    .description("format code")
    .version("1.0.0", "-V")
    .addArgument(new Argument("<code>", "code"))
    .action(async (code: string) => {
      // Detect language
      let language: SupportedLanguage | null = null;
      let output: string | null = null;
      // Format code
      for await (const lang of supportedLanguages) {
        try {
          output = await format(code, {
            parser: parserMap[lang],
            plugins: [
              "@prettier/plugin-php",
              "@prettier/plugin-python",
              "@prettier/plugin-ruby",
              "@prettier/plugin-xml",
              "prettier-plugin-java",
              "prettier-plugin-nginx",
              "prettier-plugin-rust",
              "prettier-plugin-sh",
              "prettier-plugin-sql",
              "prettier-plugin-toml",
            ],
          });
          language = lang;
          break;
        } catch {
          continue;
        }
      }
      // Error
      if (!language || !output) throwError("error: unsupported language.");
      // Display
      print.highlighted(output!, language!);
    });
}
