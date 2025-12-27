import { Command, Option } from "commander";
import { existsSync } from "fs";
import { writeAIReport } from "../../lib/ai";
import { safe } from "../../lib/args";
import { runInContainer } from "../../lib/container";
import { createFileStream } from "../../lib/files";

//  eslint-disable-next-line prettier/prettier
const supportedServices = ["adam6500", "asterisk", "cisco", "cisco-enable", "cobaltstrike", "cvs", "firebird", "ftp", "ftps", "http-head", "https-head", "http-get", "https-get", "http-post", "https-post", "http-get-form", "https-get-form", "http-post-form", "https-post-form", "http-proxy", "http-proxy-urlenum", "icq", "imap", "imaps", "irc", "ldap2", "ldap2s", "ldap3", "ldap3s", "memcached", "mongodb", "mssql", "mysql", "nntp", "oracle-listener", "oracle-sid", "pcanywhere", "pcnfs", "pop3", "pop3s", "postgres", "radmin2", "rdp", "redis", "rexec", "rlogin", "rpcap", "rsh", "rtsp", "s7-300", "sip", "smb", "smb2", "smtp", "smtps", "smtp-enum", "snmp", "socks5", "ssh", "sshkey", "svn", "teamspeak", "telnet", "telnets", "vmauthd", "vnc", "xmpp"] as const;

type SupportedService = (typeof supportedServices)[number];

export function register(cli: Command) {
  cli
    .description("run auth bruteforce (hydra)")
    .version("1.0.0", "-V")
    .addHelpText(
      "afterAll",
      `\nTools: 
hydra: github.com/vanhauser-thc/thc-hydra`,
    )
    .addOption(new Option("--id <id>", "output file identifier"))
    .addOption(new Option("--ai", "generate AI report"))
    .addOption(
      new Option(
        "-t, --target <target>",
        "* target host/domain/url",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("-P, --port <port>", "port number"))
    .addOption(
      new Option("-s, --service <service>", "* service name")
        .choices(supportedServices)
        .makeOptionMandatory(),
    )
    .addOption(new Option("-o, --options <options>", "* service options"))
    .addOption(
      new Option(
        "-l, --login <login>",
        "* login or logins file",
      ).makeOptionMandatory(),
    )
    .addOption(
      new Option(
        "-p, --password <password>",
        "* password or passwords file",
      ).makeOptionMandatory(),
    )
    .addOption(new Option("--flags-hydra <flags>", "hydra flags"))
    .action(
      async (opts: {
        id?: string;
        ai?: boolean;
        target: string;
        service: SupportedService;
        options?: string;
        port?: string;
        login: string;
        password: string;
        flagsHydra?: string;
      }) => {
        // Setup
        const outputId = `bruteforce_auth_${opts.id || opts.target}`;
        const [, file] = createFileStream(outputId);
        // Command
        let cmd = `figlet "Ni!" \n`;
        const files: { local: string; remote: string }[] = [];
        // Setup files
        if (existsSync(opts.login))
          files.push({ local: opts.login, remote: "/data/login.txt" });
        else cmd += `echo "${safe(opts.login)}" > /data/login.txt \n`;
        if (existsSync(opts.password))
          files.push({ local: opts.password, remote: "/data/password.txt" });
        else cmd += `echo "${safe(opts.password)}" > /data/password.txt \n`;
        // Hydra command
        cmd += `figlet "hydra" \n`;
        cmd += `hydra ${opts.flagsHydra || ""} -I -L /data/login.txt -P /data/password.txt`;
        if (opts.port) cmd += ` -s "${safe(opts.port)}"`;
        if (opts.options) cmd += ` -m "${safe(opts.options)}"`;
        cmd += ` "${safe(opts.target)}" "${safe(opts.service)}"`;
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
