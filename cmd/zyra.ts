import { buildProject } from "../compiler/driver";

function usage(): never {
  throw new Error(`Usage:
  tsx cmd/zyra.ts <entry.zy> [--out dist] [--root .]
  tsx cmd/zyra.ts build <entry.zy> [--out dist] [--root .]
`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) usage();

  let entry = "";
  let outDir: string | undefined;
  let rootDir: string | undefined;

  if (args[0] === "build") {
    if (!args[1]) usage();
    entry = args[1];

    for (let i = 2; i < args.length; i++) {
      if (args[i] === "--out") outDir = args[++i];
      else if (args[i] === "--root") rootDir = args[++i];
    }
  } else {
    entry = args[0];

    for (let i = 1; i < args.length; i++) {
      if (args[i] === "--out") outDir = args[++i];
      else if (args[i] === "--root") rootDir = args[++i];
    }
  }

  buildProject({
    entry,
    outDir: outDir ?? "dist",
    rootDir: rootDir ?? ".",
    projectRoot: process.cwd(),
  });

  console.log(`Built ${entry} -> ${outDir ?? "dist"}/`);
}

try {
  main();
} catch (err) {
  console.error(String(err));
  process.exit(1);
}
