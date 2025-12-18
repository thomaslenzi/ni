#!/usr/bin/env bun
import { program } from "commander";
import "dotenv/config";
import { readdirSync } from "fs";
import { join } from "path";

// Setup CLI
program.name("ni").description("a collection of pentesting tools");

// Dynamically import categories and tools
for await (const category of readdirSync(join(__dirname, "tools"), {
  withFileTypes: true,
})) {
  // Skip non-directories
  if (!category.isDirectory()) continue;
  // Normalize category name and alias
  const catName = category.name.replace(/[^A-Za-z]+/g, "").toLowerCase();
  const catAlias = category.name.replace(/[^A-Z]+/g, "").toLowerCase();
  // Setup category cli
  const catCli = program.command(catName);
  if (catAlias) catCli.alias(catAlias);
  // Dynamically import tools in category
  for await (const tool of readdirSync(
    join(category.parentPath, category.name),
    { withFileTypes: true },
  )) {
    // Skip non-.ts files
    if (!tool.isFile() || !tool.name.endsWith(".ts")) continue;
    // Import and register tool
    const mod = await import(join(tool.parentPath, tool.name));
    if (mod.register) {
      // Normalize tool name and alias
      const toolName = tool.name
        .replace(/\.ts$/, "")
        .replace(/[^A-Za-z]+/g, "")
        .toLowerCase();
      const toolAlias = tool.name
        .replace(/\.ts$/, "")
        .replace(/[^A-Z]+/g, "")
        .toLowerCase();
      // Setup tool cli
      const toolCli = catCli.command(toolName);
      if (toolAlias) toolCli.alias(toolAlias);
      // Register tool
      mod.register(toolCli);
    }
  }
}

// Parse stdin
if (!process.stdin.isTTY) {
  process.stdin.setEncoding("utf8");
  let stdin = "";
  for await (const chunk of process.stdin) stdin += chunk;
  const i = process.argv.indexOf("--");
  if (i !== -1) process.argv[i] = stdin;
  else process.argv.push(stdin);
}

// Run
program.parse(process.argv);
