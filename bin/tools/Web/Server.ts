import { Command, Option } from "commander";
import fs from "fs";
import path from "path";
import { argPInt } from "../../lib/args";
import { runInContainer } from "../../lib/container";

export function register(cli: Command) {
  cli
    .description("spin-up a web server")
    .version("1.0.0", "-V")
    .addOption(
      new Option("-t, --type <type>", "server type")
        .choices(["raw", "static", "router"])
        .default("raw"),
    )
    .addOption(
      new Option("-P, --port <port>", "port").default(8080).argParser(argPInt),
    )
    .action(async (opts: { type: string; port: number }) => {
      // Create directory
      fs.mkdirSync(path.join(process.cwd(), "in", "web"), { recursive: true });
      // Command
      let cmd = `figlet "ni" \n`;
      // Server
      cmd = `figlet server \n`;
      // Netcat
      if (opts.type === "raw") cmd = `nc -lvnp 8080`;
      // PHP static
      else if (opts.type === "static") cmd = `php -S 0.0.0.0:8080 -t /data/in`;
      // PHP router
      else if (opts.type === "router")
        cmd = `php -S 0.0.0.0:8080 -t /data/in/router.php`;
      // Run
      await runInContainer({
        cmd: cmd,
        stdout: process.stdout,
        files: [
          { local: path.join(process.cwd(), "in", "web"), remote: "/data/in" },
        ],
        ports: [{ local: opts.port, remote: 8080 }],
      });
    });
}
