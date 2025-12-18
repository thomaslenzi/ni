import { Command, Option } from "commander";
import { existsSync } from "fs";
import { writeAIReport } from "../../lib/ai";
import { argPInt } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

export function register(cli: Command) {
  cli
    .description("run bruteforce attack (hydra)")
    .version("1.0.0", "-V")
    .addOption(new Option("--id <id>", "output identifier").default(""))
    .addOption(new Option("--ai", "generate AI report").default(false))
    .addOption(
      new Option(
        "-t, --target <target>",
        "target host/domain/url",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option("-P, --port <port>", "port number").argParser(argPInt),
    )
    .addOption(
      new Option("-s, --service <service>", "service name")
        //  eslint-disable-next-line prettier/prettier
        .choices(["adam6500", "asterisk", "cisco", "cisco-enable", "cobaltstrike", "cvs", "firebird", "ftp", "ftps", "http-head", "https-head", "http-get", "https-get", "http-post", "https-post", "http-get-form", "https-get-form", "http-post-form", "https-post-form", "http-proxy", "http-proxy-urlenum", "icq", "imap", "imaps", "irc", "ldap2", "ldap2s", "ldap3", "ldap3s", "memcached", "mongodb", "mssql", "mysql", "nntp", "oracle-listener", "oracle-sid", "pcanywhere", "pcnfs", "pop3", "pop3s", "postgres", "radmin2", "rdp", "redis", "rexec", "rlogin", "rpcap", "rsh", "rtsp", "s7-300", "sip", "smb", "smb2", "smtp", "smtps", "smtp-enum", "snmp", "socks5", "ssh", "sshkey", "svn", "teamspeak", "telnet", "telnets", "vmauthd", "vnc", "xmpp"])
        .makeOptionMandatory(),
    )
    .addOption(
      new Option("-o, --option <option>", "service options").default(""),
    )
    .addOption(
      new Option(
        "-l, --login <login>",
        "login or logins file",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "-p, --password <password>",
        "password or passwords file",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("--flags-hydra <flags>", "hydra flags").default(""))
    .action(
      async (opts: {
        id: string;
        ai: boolean;
        target: string;
        service: string;
        option: string;
        port?: number;
        login: string;
        password: string;
        flagsHydra: string;
      }) => {
        // Setup
        const [, file] = createFileStream(
          "bruteforce",
          "attack",
          opts.id || opts.target,
        );
        // Command
        let cmd = `figlet "ni" && `;
        const files = [];
        // Setup files
        if (existsSync(opts.login))
          files.push({ local: opts.login, remote: "/data/login.txt" });
        else cmd += `echo "${opts.login}" > /data/login.txt && `;
        if (existsSync(opts.password))
          files.push({ local: opts.password, remote: "/data/password.txt" });
        else cmd += `echo "${opts.password}" > /data/password.txt && `;
        // Hydra command
        cmd += `figlet "hydra" && `;
        cmd += `hydra -I -L /data/login.txt -P /data/password.txt ${opts.flagsHydra}`;
        if (opts.port) cmd += ` -s ${opts.port}`;
        cmd += ` ${opts.target} ${opts.service}`;
        if (opts.option) cmd += ` "${opts.option}"`;
        // Run
        const data = await runInContainer({
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
