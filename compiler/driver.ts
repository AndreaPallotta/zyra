import fs from "node:fs";
import path from "node:path";
import { lex } from "./lexer.js";
import { Parser } from "./parser.js";
import { check } from "./checker.js";
import { print } from "./printer.js";
import {
  ResolveConfig,
  resolveZyPath,
  outJsPathForZy,
  toRelativeImport,
} from "./module_resolver.js";
import { Program } from "./ast.js";

type ModuleInfo = {
  zyAbs: string;
  outJsAbs: string;
  program: Program;
  imports: {
    fromSpec: string;
    resolvedZyAbs: string;
    resolvedOutJsAbs: string;
  }[];
};

export type BuildOptions = {
  entry: string;
  projectRoot?: string;
  rootDir?: string;
  outDir?: string;
};

export function buildProject(opts: BuildOptions) {
  const projectRoot = path.resolve(opts.projectRoot ?? process.cwd());
  const rootDirAbs = path.resolve(projectRoot, opts.rootDir ?? ".");
  const outDirAbs = path.resolve(projectRoot, opts.outDir ?? "dist");

  const cfg: ResolveConfig = { projectRoot, rootDirAbs, outDirAbs };

  const entryAbs = path.resolve(projectRoot, opts.entry);
  const visited = new Map<string, ModuleInfo>();

  compileModule(entryAbs, cfg, visited);

  validateImports(visited);

  for (const info of visited.values()) {
    rewriteImports(info, cfg);
  }

  fs.mkdirSync(outDirAbs, { recursive: true });

  for (const info of visited.values()) {
    const isEntry = info.zyAbs === entryAbs;
    const js = print(info.program, { entry: isEntry });

    fs.mkdirSync(path.dirname(info.outJsAbs), { recursive: true });
    fs.writeFileSync(info.outJsAbs, js + "\n", "utf8");
  }

  const entryOutJsAbs = outJsPathForZy(entryAbs, cfg);
  const entryBase = path.basename(entryAbs, path.extname(entryAbs));
  const runnerAbs = path.join(outDirAbs, `${entryBase}.mjs`);

  const rel = toRelativeImport(runnerAbs, entryOutJsAbs);
  fs.writeFileSync(
    runnerAbs,
    `import __zyra_main from "${rel}";\nconsole.log(__zyra_main);\n`,
    "utf8",
  );
}

function compileModule(
  zyAbs: string,
  cfg: ResolveConfig,
  visited: Map<string, ModuleInfo>,
): ModuleInfo {
  if (visited.has(zyAbs)) return visited.get(zyAbs)!;

  if (!fs.existsSync(zyAbs)) {
    throw new Error(`Module not found: ${zyAbs}`);
  }

  const source = fs.readFileSync(zyAbs, "utf8");
  const tokens = lex(source);
  const parser = new Parser(tokens);
  const program = parser.parseProgram();

  const diags = check(program);
  if (diags.length) {
    const errs = diags.filter((d) => d.level === "error");
    const warns = diags.filter((d) => d.level === "warn");

    for (const w of warns) console.warn(`warn: ${w.message}`);
    if (errs.length) throw new Error(errs.map((e) => e.message).join("\n"));
  }

  const outJsAbs = outJsPathForZy(zyAbs, cfg);

  const info: ModuleInfo = {
    zyAbs,
    outJsAbs,
    program,
    imports: [],
  };

  visited.set(zyAbs, info);

  for (const st of program.body) {
    if (st.type !== "ImportDecl") continue;

    const resolvedZyAbs = resolveZyPath(st.from, cfg);
    const resolvedOutJsAbs = outJsPathForZy(resolvedZyAbs, cfg);

    info.imports.push({
      fromSpec: st.from,
      resolvedZyAbs,
      resolvedOutJsAbs,
    });

    compileModule(resolvedZyAbs, cfg, visited);
  }

  return info;
}

function validateImports(visited: Map<string, ModuleInfo>) {
  const exportsByZyAbs = new Map<string, Set<string>>();
  for (const m of visited.values()) {
    exportsByZyAbs.set(m.zyAbs, collectExports(m.program));
  }

  for (const m of visited.values()) {
    const resolvedByFromSpec = new Map<string, string>();
    for (const imp of m.imports) {
      resolvedByFromSpec.set(imp.fromSpec, imp.resolvedZyAbs);
    }

    for (const st of m.program.body) {
      if (st.type !== "ImportDecl") continue;

      const targetZyAbs = resolvedByFromSpec.get(st.from);
      if (!targetZyAbs) {
        throw new Error(
          `Internal: could not resolve import '${st.from}' in ${m.zyAbs}`,
        );
      }

      const exported = exportsByZyAbs.get(targetZyAbs) ?? new Set<string>();

      for (const name of st.names) {
        if (!exported.has(name)) {
          throw new Error(
            `Import error in ${m.zyAbs}: '${name}' is not exported by ${targetZyAbs}`,
          );
        }
      }
    }
  }
}

function rewriteImports(info: ModuleInfo, cfg: ResolveConfig) {
  if (!info.imports.length) return;

  const fromOut = info.outJsAbs;

  const importMap = new Map<string, string>();
  for (const imp of info.imports) {
    const rel = toRelativeImport(fromOut, imp.resolvedOutJsAbs);
    importMap.set(imp.fromSpec, rel);
  }

  for (const st of info.program.body) {
    if (st.type === "ImportDecl") {
      const replaced = importMap.get(st.from);
      if (!replaced) continue;
      st.from = replaced;
    }
  }
}

function collectExports(program: Program): Set<string> {
  const out = new Set<string>();

  for (const st of program.body) {
    if (st.type === "VarDecl" && st.isExported) out.add(st.name);
    if (st.type === "FunctionDecl" && st.isExported) out.add(st.name);
  }

  return out;
}
