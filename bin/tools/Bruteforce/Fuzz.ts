import { Command, Option } from "commander";
import { existsSync } from "fs";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run fuzzing bruteforce (ffuf)")
    .addHelpText(
      "afterAll",
      `\nTools: 
ffuf: github.com/ffuf/ffuf`,
    )
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option("-u, --url <url>", "* target url").makeOptionMandatory(),
    )
    .addOption(
      new Option("-X, --request <method>", "HTTP method")
        .choices(["GET", "POST", "PUT", "DELETE", "PATCH"])
        .default("GET"),
    )
    .addOption(new Option("-H, --header <header...>", "HTTP header(s)"))
    .addOption(new Option("-d, --data <data>", "HTTP POST data"))
    .addOption(new Option("--json", "flag data as JSON"))
    .addOption(
      new Option(
        "-w, --wordlist <file:ID...>",
        "* wordlist file(s)",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("--mc <match>", "match status codes"))
    .addOption(new Option("--mr <match>", "match regexp"))
    .addOption(new Option("--ms <match>", "match response size"))
    .addOption(new Option("--ml <match>", "match number lines"))
    .addOption(new Option("--mw <match>", "match number words"))
    .addOption(new Option("--fc <filter>", "filter status codes"))
    .addOption(new Option("--fr <filter>", "filter regexp"))
    .addOption(new Option("--fs <filter>", "filter response size"))
    .addOption(new Option("--fl <filter>", "filter number lines"))
    .addOption(new Option("--fw <filter>", "filter number words"))
    .addOption(new Option("--flags-ffuf <flags>", "ffuf flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        url: string;
        request: string;
        header?: string[];
        data?: string;
        json?: boolean;
        wordlist: string[];
        mc?: string;
        mr?: string;
        ms?: string;
        ml?: string;
        mw?: string;
        fc?: string;
        fr?: string;
        fs?: string;
        fl?: string;
        fw?: string;
        flagsFfuf?: string;
      }) => {
        // Setup
        const outputId = `bruteforce_fuzz_${opts.id || opts.url}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        const files: { local: string; remote: string }[] = [];
        // Ffuf command
        cmd += `figlet "ffuf" \n`;
        cmd += `/root/go/bin/ffuf ${opts.flagsFfuf || ""} -r -u "${safe(opts.url)}" -X "${safe(opts.request)}"`;
        opts.header?.forEach((header) => (cmd += ` -H "${safe(header)}"`));
        if (opts.data) cmd += ` -d "${safe(opts.data)}"`;
        if (opts.json) cmd += ` -H "Content-Type: application/json"`;
        opts.wordlist.forEach((wl) => {
          const [filepath, id] = wl.split(":");
          if (existsSync(filepath!)) {
            files.push({
              local: filepath!,
              remote: `/data/${id || "FUZZ"}.txt`,
            });
            cmd += ` -w /data/${id || "FUZZ"}.txt:${id || "FUZZ"}`;
          } else cmd += ` -w "${safe(wl)}"`;
        });
        if (opts.mc) cmd += ` -mc "${safe(opts.mc)}"`;
        if (opts.mr) cmd += ` -mr "${safe(opts.mr)}"`;
        if (opts.ms) cmd += ` -ms "${safe(opts.ms)}"`;
        if (opts.ml) cmd += ` -ml "${safe(opts.ml)}"`;
        if (opts.mw) cmd += ` -mw "${safe(opts.mw)}"`;
        if (opts.fc) cmd += ` -fc "${safe(opts.fc)}"`;
        if (opts.fr) cmd += ` -fr "${safe(opts.fr)}"`;
        if (opts.fs) cmd += ` -fs "${safe(opts.fs)}"`;
        if (opts.fl) cmd += ` -fl "${safe(opts.fl)}"`;
        if (opts.fw) cmd += ` -fw "${safe(opts.fw)}"`;
        // Run
        const data = await runInContainer({
          outputId,
          cmd,
          stdout: process.stdout,
          fsout: file,
          files,
        });
        // AI
        if (opts.ai)
          await writeAIReport({ data, stdout: process.stdout, fsout: file });
      },
    );
}
