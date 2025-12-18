import { spawn } from "child_process";
import { once } from "events";
import fs from "fs";
import stripAnsi from "strip-ansi";

/**
 * Run command inside docker container
 * @param cmd the command to run
 * @param stdout the output stream to write to with ANSI
 * @param fsout the file stream to write to without ANSI
 * @param files the files to mount
 * @param ports the ports to forward
 * @return the command output without ANSI
 */
export async function runInContainer({
  cmd,
  stdout = null,
  fsout = null,
  files = [],
  ports = [],
}: {
  cmd: string;
  stdout?: NodeJS.WriteStream | null;
  fsout?: fs.WriteStream | null;
  files?: { local: string; remote: string }[];
  ports?: { local: number; remote: number }[];
}): Promise<string> {
  // Parse command (must escape double quotes for bash -c)
  const parsedCmd = cmd.replace(/"/g, '\\"');
  // Spawn Docker container
  const term = spawn(
    "docker",
    [
      "run",
      ...files.map(
        (f) => `--mount type=bind,source=${f.local},target=${f.remote}`,
      ),
      ...ports.map((p) => `-p ${p.local}:${p.remote}`),
      "--rm",
      "-it",
      '--entrypoint=""',
      "ni",
      "bash",
      "-l",
      "-c",
      `"${parsedCmd}"`,
    ].filter(Boolean),
    {
      shell: true,
      stdio: ["inherit", "pipe", "pipe"], // stdin inherit to support TTY in Docker
    },
  );
  // stderr
  term.stderr.on("data", (data) => process.stderr.write(data));
  // stdout
  let dataOutput = "";
  term.stdout.on("data", (data) => {
    // Strip ANSI for data output
    const stripped = stripAnsi(data.toString());
    dataOutput += stripped;
    stdout?.write(data);
    fsout?.write(stripped);
  });
  // Signals
  process.on("SIGINT", () => term.kill("SIGINT"));
  process.on("SIGTERM", () => term.kill("SIGTERM"));
  process.on("SIGKILL", () => term.kill("SIGKILL"));
  process.on("exit", () => term.kill("SIGKILL"));
  process.on("exit", () => term.kill("SIGKILL"));
  await once(term, "close");
  // Data
  return dataOutput;
}
