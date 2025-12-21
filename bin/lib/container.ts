import { spawn } from "child_process";
import { once } from "events";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import stripAnsi from "strip-ansi";

/**
 * Run command inside docker container
 * @param outputId the output identifier
 * @param cmd the command to run
 * @param stdout the output stream to write to with ANSI
 * @param fsout the file stream to write to without ANSI
 * @param files the files to mount
 * @param ports the ports to forward
 * @return the command output without ANSI
 */
export async function runInContainer({
  outputId,
  cmd,
  stdout = null,
  fsout = null,
  files = [],
  ports = [],
}: {
  outputId: string;
  cmd: string;
  stdout?: NodeJS.WriteStream | null;
  fsout?: fs.WriteStream | null;
  files?: { local: string; remote: string }[];
  ports?: { local: number; remote: number }[];
}): Promise<string> {
  // Create directory if it doesn't exist
  fs.mkdirSync(path.join(process.cwd(), "ni", "cmd"), { recursive: true });
  // Create cmd file
  const filePath = path.join(
    process.cwd(),
    "ni",
    "cmd",
    slugify(outputId, { lower: false, trim: true }) + ".sh",
  );
  fs.writeFileSync(filePath, cmd, { flag: "w+" });
  // Spawn Docker container
  const term = spawn(
    "docker",
    [
      "run",
      `--mount type=bind,source=${filePath},target=/data/cmd.sh`,
      ...files.map(
        (f) => `--mount type=bind,source=${f.local},target=${f.remote}`,
      ),
      ...ports.map((p) => `-p ${p.local}:${p.remote}`),
      "--rm",
      "-it",
      "ni",
      "bash",
      "/data/cmd.sh",
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
