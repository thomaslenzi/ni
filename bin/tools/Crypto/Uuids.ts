import { Command, Option } from "commander";
import { NIL, v1, v3, v4, v5, v6, v7 } from "uuid";
import { argPInt } from "../../lib/args";
import * as print from "../../lib/print";
import { throwError } from "../../lib/utils";

// Supported versions
const supportedVersions = ["0", "1", "3", "4", "5", "6", "7"] as const;

type SupportedVersion = (typeof supportedVersions)[number];

// Supported namespaces
const supportedNamespaces = ["dns", "url", "oid", "x500"] as const;

type SupportedNamespace = (typeof supportedNamespaces)[number];

// Namespace UUID mapping
const namespaceMapping: Record<SupportedNamespace, string> = {
  dns: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  url: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  oid: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  x500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
};

export function register(cli: Command) {
  cli
    .description("generate UUIDs")
    .version("1.0.0", "-V")
    .addOption(new Option("-w, --waw", "waw/pretty mode").default(false))
    .addOption(
      new Option("-v, --version <version>", "version")
        .choices(supportedVersions)
        .default("4"),
    )
    .addOption(
      new Option(
        "-n, --namespace <namespace>",
        "namespace, required for v3 and v5",
      ).choices(supportedNamespaces),
    )
    .addOption(new Option("-m, --name <name>", "name, required for v3 and v5"))
    .addOption(
      new Option("-N, --number <n>", "number").default(10).argParser(argPInt),
    )
    .action(
      (opts: {
        waw: boolean;
        version: SupportedVersion;
        namespace?: SupportedNamespace;
        name?: string;
        number: number;
      }) => {
        // Validate args
        if ((opts.version === "3" || opts.version === "5") && !opts.namespace)
          throwError(
            "error: option '-n, --namespace <namespace>' is required for UUIDs v3 and v5.",
          );
        if ((opts.version === "3" || opts.version === "5") && !opts.name)
          throwError(
            "error: option '-m, --name <name>' is required for UUIDs v3 and v5.",
          );
        // Generate UUIDs
        const uuids: string[] = [];
        for (let i = 0; i < opts.number; i++) {
          let uuid: string = "";
          if (opts.version === "0") uuid = NIL;
          else if (opts.version === "1") uuid = v1();
          else if (opts.version === "3")
            uuid = v3(opts.name!, namespaceMapping[opts.namespace!]);
          else if (opts.version === "4") uuid = v4();
          else if (opts.version === "5")
            uuid = v5(opts.name!, namespaceMapping[opts.namespace!]);
          else if (opts.version === "6") uuid = v6();
          else if (opts.version === "7") uuid = v7();
          uuids.push(uuid);
        }
        // Display
        if (opts.waw)
          print.table(
            ["#", "UUID"],
            uuids.map((uuid, i) => [`${i + 1}`, uuid]),
          );
        else print.ln(uuids.join("\n"));
      },
    );
}
