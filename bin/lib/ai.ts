import figlet from "figlet";
import fs from "fs";
import OpenAI from "openai";

/**
 * Ask AI a question
 * @param instructions the instructions
 * @param data the data to analyze
 * @returns the AI response
 */
export async function askAIQuestion({
  instructions,
  data,
}: {
  instructions: string;
  data: string;
}): Promise<string> {
  // Check API key
  if (!process.env.OPENAI_API_KEY) return "";
  // OpenAI client
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  // Ask question
  const response = await client.responses.create({
    model: "gpt-5-nano-2025-08-07",
    instructions,
    input: data,
  });
  // Return response
  return response.output_text || "";
}

/**
 * Write AI report
 * @param data the data to analyze
 * @param stdout the stdout stream
 * @param fsout the file stream
 */
export async function writeAIReport({
  data,
  stdout,
  fsout,
}: {
  data: string;
  stdout?: NodeJS.WriteStream | null;
  fsout?: fs.WriteStream | null;
}): Promise<void> {
  // Check API key
  if (!process.env.OPENAI_API_KEY) return;
  // OpenAI client
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  // Generate report
  const response = await client.responses.create({
    model: "gpt-4o",
    instructions: `You are a senior cybersecurity expert tasked with finding vulnerabilities in systems. 
Provide a very concise report based on the provided data. Focus on potential vulnerabilities and how to exploit them. 
Do not provide general information or explanations. Use bullet points for clarity.`,
    input: data,
  });
  // Write
  const result = `\n\n${figlet.textSync("AI REPORT")}\n\n${response.output_text}`;
  stdout?.write(result);
  fsout?.write(result);
}
