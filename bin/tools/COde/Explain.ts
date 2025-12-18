import { Argument, Command } from "commander";
import { askAIQuestion } from "../../lib/ai";
import * as print from "../../lib/print";

export function register(cli: Command) {
  cli
    .description("explain code using AI")
    .version("1.0.0", "-V")
    .addArgument(new Argument("<code>", "code"))
    .action(async (code: string) => {
      // Ask AI
      const summary = await askAIQuestion({
        instructions: `You are a senior programmer. Your task is to provide a concise summary of code. If you detect any potential vulnerabilities, mention them in the summary. Keep the summary brief and to the point.`,
        data: `Summarize this code:\n\n${code}`,
      });
      // Display
      if (!summary) print.error("No summary generated.");
      else print.ln(summary);
    });
}
