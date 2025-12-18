import chalk from "chalk";
import highlight from "cli-highlight";
import Table from "cli-table3";

/**
 * Prints an error message to stderr in red
 * @param message the message to print
 */
export function error(message: string) {
  process.stderr.write(chalk.red(message));
  process.stderr.write("\n");
}

/**
 * Prints a warning message to stderr in yellow
 * @param message the message to print
 */
export function warning(message: string) {
  process.stderr.write(chalk.yellow(message));
  process.stderr.write("\n");
}

/**
 * Prints highlighted code to stdout
 * @param code the code to highlight
 * @param language the language of the code
 */
export function highlighted(code: string, language: string) {
  process.stdout.write(
    highlight(code, {
      language,
      ignoreIllegals: true,
    }),
  );
  process.stdout.write("\n");
}

/**
 * Prints a table to stdout
 * @param head the column headers
 * @param rows the table rows
 */
export function table(head: string[], rows: string[][]) {
  const table = new Table({
    head,
    style: { head: ["cyan"] },
    wordWrap: true,
    wrapOnWordBoundary: false,
  });
  table.push(...rows);
  process.stdout.write(table.toString());
  process.stdout.write("\n");
}

/**
 * Prints a string to stdout with a newline
 * @param str the string to print
 */
export function ln(str: string) {
  process.stdout.write(str);
  process.stdout.write("\n");
}
