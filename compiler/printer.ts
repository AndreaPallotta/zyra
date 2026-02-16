import {
  Program,
  Statement,
  VarDecl,
  FunctionDecl,
  ExpressionStmt,
  Block,
  Expression,
  BinaryExpr,
} from "./ast.js";
import { ZYRA_FMT_HELPER } from "./static.js";

export function print(program: Program, opts?: { entry?: boolean }): string {
  if (opts?.entry) return printEntry(program);
  return printNormal(program);
}

function printNormal(program: Program): string {
  const lines: string[] = [];

  if (needsFmt(program)) {
    lines.push(ZYRA_FMT_HELPER, "");
  }

  lines.push(...program.body.map(printStatement).filter(Boolean));
  return lines.join("\n");
}

function needsFmt(program: Program): boolean {
  return program.body.some(
    (st: any) => st.type === "PrintStmt" && st.kind === "print",
  );
}

function printEntry(program: Program): string {
  const imports: Statement[] = [];
  const exported: Statement[] = [];
  const rest: Statement[] = [];

  for (const st of program.body) {
    if (st.type === "ImportDecl") {
      imports.push(st);
      continue;
    }

    if (
      (st.type === "VarDecl" && !!st.isExported) ||
      (st.type === "FunctionDecl" && !!st.isExported)
    ) {
      exported.push(st);
      continue;
    }

    rest.push(st);
  }

  const lines: string[] = [];

  for (const st of imports) {
    const s = printStatement(st);
    if (s) lines.push(s);
  }
  if (imports.length) lines.push("");

  for (const st of exported) {
    const s = printStatement(st);
    if (s) lines.push(s);
  }
  if (exported.length) lines.push("");

  lines.push("const __zyra_main = (() => {");
  if (needsFmt(program)) {
    lines.push(indent(ZYRA_FMT_HELPER, 2));
    lines.push("");
  }

  if (rest.length === 0) {
    lines.push("  return undefined;");
  } else {
    for (let i = 0; i < rest.length; i++) {
      const st = rest[i];
      const isLast = i === rest.length - 1;

      if (isLast && st.type === "ExpressionStmt") {
        lines.push(`  return ${printExpr(st.expression)};`);
      } else {
        const s = printStatement(st);
        if (s) lines.push(indent(s, 2));
      }
    }

    const last = rest[rest.length - 1];
    if (last.type !== "ExpressionStmt") {
      lines.push("  return undefined;");
    }
  }

  lines.push("})();");
  lines.push("export default __zyra_main;");

  return lines.join("\n");
}

function printStatement(stmt: Statement): string {
  switch (stmt.type) {
    case "VarDecl":
      return printVarDecl(stmt);
    case "FunctionDecl":
      return printFunction(stmt);
    case "StructDecl":
      return "";
    case "EnumDecl":
      return "";
    case "ImportDecl": {
      const resolved = resolveImportPath(stmt.from);
      return `import { ${stmt.names.join(", ")} } from "${resolved}";`;
    }
    case "ExpressionStmt":
      return `${printExpr(stmt.expression)};`;
    case "PrintStmt":
      return printPrintStmt(stmt);
    case "ReturnStmt":
      return stmt.value ? `return ${printExpr(stmt.value)};` : `return;`;
  }
}

function printVarDecl(node: VarDecl): string {
  const prefix = node.isExported ? "export " : "";
  const init = printExpr(node.initializer);

  if (init.includes("\n")) {
    return `${prefix}${node.kind} ${node.name} = (\n${indent(init, 2)}\n);`;
  }
  return `${prefix}${node.kind} ${node.name} = ${init};`;
}

function printPrintStmt(node: any): string {
  if (node.kind === "print_raw") {
    const args = node.args
      .map((a: any) => `JSON.stringify(${printExpr(a)})`)
      .join(", ");
    return `console.log(${args});`;
  }

  const args = node.args
    .map((a: any) => `__zyra_fmt(${printExpr(a)})`)
    .join(", ");
  return `console.log(${args});`;
}

function printFunction(node: FunctionDecl): string {
  const prefix = node.isExported ? "export " : "";
  const params = node.params.map((p) => p.name).join(", ");
  const body = printBlock(node.body);
  return `${prefix}function ${node.name}(${params}) ${body}`;
}

function printBlock(block: Block): string {
  const lines: string[] = [];
  lines.push("{");

  block.statements.forEach((stmt, i) => {
    const isLast = i === block.statements.length - 1;

    if (isLast && stmt.type === "ExpressionStmt") {
      lines.push(`  return ${printExpr(stmt.expression)};`);
      return;
    }

    lines.push("  " + printStatement(stmt));
  });

  lines.push("}");
  return lines.join("\n");
}

function printExpr(expr: Expression): string {
  switch (expr.type) {
    case "Identifier":
      return expr.name;

    case "IntLiteral":
      return String(expr.value);

    case "StringLiteral":
      return JSON.stringify(expr.value);

    case "BinaryExpr":
      return printBinary(expr);

    case "CallExpr":
      return `${printExpr(expr.callee)}(${expr.args.map(printExpr).join(", ")})`;

    case "BoolLiteral":
      return expr.value ? "true" : "false";

    case "IfExpr":
      return printIfExpr(expr);

    case "UnaryExpr":
      return `!${printExpr(expr.operand)}`;

    case "MatchExpr":
      return printMatch(expr);

    case "StructLiteral":
      return printStructLiteral(expr);

    case "StructUpdateExpr":
      return printStructUpdate(expr);

    case "EnumLiteral": {
      const base = `__e: "${expr.enumName}", __c: "${expr.variant}"`;
      if (expr.payloadField && expr.payload) {
        return `{ ${base}, ${expr.payloadField}: ${printExpr(expr.payload)} }`;
      }
      return `{ ${base} }`;
    }

    case "InterpString":
      return printInterpString(expr);

    case "Block":
      return printBlock(expr);

    default:
      throw new Error(`Unknown expression: ${(expr as any).type}`);
  }
}

function printBinary(node: BinaryExpr): string {
  const op =
    node.operator === "=="
      ? "==="
      : node.operator === "!="
        ? "!=="
        : node.operator;

  return `${printExpr(node.left)} ${op} ${printExpr(node.right)}`;
}

function escapeTemplateText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function printInterpString(node: any): string {
  const out: string[] = [];
  out.push("`");

  for (const p of node.parts) {
    if (p.type === "Text") {
      out.push(escapeTemplateText(p.value));
    } else {
      out.push("${__zyra_fmt(" + printExpr(p.expr) + ")}");
    }
  }

  out.push("`");
  return out.join("");
}

function printIfExpr(node: any): string {
  const lines: string[] = [];
  lines.push("(() => {");

  if (node.init) {
    lines.push("  " + printStatement(node.init));
  }

  lines.push(indent(printIfChain(node), 2));
  lines.push("})()");
  return lines.join("\n");
}

function printIfChain(node: any): string {
  const cond = printExpr(node.condition);
  const thenBlock = printBlock(node.thenBranch);

  if (node.elseBranch.type === "IfExpr") {
    const elseIf = printIfChain(node.elseBranch);
    return `if (${cond}) ${thenBlock} else ${elseIf}`;
  } else {
    const elseBlock = printBlock(node.elseBranch);
    return `if (${cond}) ${thenBlock} else ${elseBlock}`;
  }
}

function indent(s: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return s
    .split("\n")
    .map((line) => pad + line)
    .join("\n");
}

function printMatch(node: any): string {
  const lines: string[] = [];
  lines.push("(() => {");
  lines.push(`  const __match = ${printExpr(node.value)};`);
  lines.push(
    "  if (!(__match && typeof __match === 'object' && '__c' in __match)) {",
  );
  lines.push(`    throw new Error("match: expected tagged enum");`);
  lines.push("  }");
  lines.push("  switch (__match.__c) {");

  let hasDefault = false;

  node.arms.forEach((arm: any) => {
    if (arm.pattern.type === "WildcardPattern") {
      hasDefault = true;
      lines.push("    default:");
      if (arm.guard) {
        lines.push(`      if (!(${printExpr(arm.guard)})) break;`);
      }
      lines.push(`      return ${printExpr(arm.body)};`);
      return;
    }

    if (arm.pattern.type === "VariantPattern") {
      lines.push(`    case "${arm.pattern.variant}": {`);

      if (arm.pattern.bind) {
        lines.push(
          `      const ${arm.pattern.bind} = __match.${arm.pattern.payloadField};`,
        );
      }

      if (arm.guard) {
        lines.push(`      if (!(${printExpr(arm.guard)})) break;`);
      }

      lines.push(`      return ${printExpr(arm.body)};`);
      lines.push("    }");
      return;
    }

    if (
      arm.pattern.type === "LiteralPattern" &&
      arm.pattern.value.type === "Identifier"
    ) {
      lines.push(`    case "${arm.pattern.value.name}":`);
      lines.push(`      return ${printExpr(arm.body)};`);
      return;
    }

    lines.push("    default:");
    lines.push(`      throw new Error("match: unsupported pattern");`);
  });

  if (!hasDefault) {
    lines.push("    default:");
    lines.push(`      throw new Error("match: no default arm");`);
  }

  lines.push("  }");
  lines.push("})()");
  return lines.join("\n");
}

function printStructLiteral(node: any): string {
  const lines: string[] = [];
  lines.push("{");
  lines.push(`  __t: "${node.name}",`);
  node.fields.forEach((f: any, i: number) => {
    const comma = i === node.fields.length - 1 ? "" : ",";
    lines.push(`  ${f.name}: ${printExpr(f.value)}${comma}`);
  });
  lines.push("}");
  return lines.join("\n");
}

function printStructUpdate(node: any): string {
  const lines: string[] = [];
  lines.push("{");
  lines.push(`  ...${printExpr(node.target)},`);
  node.fields.forEach((f: any, i: number) => {
    const comma = i === node.fields.length - 1 ? "" : ",";
    lines.push(`  ${f.name}: ${printExpr(f.value)}${comma}`);
  });
  lines.push("}");
  return lines.join("\n");
}

function resolveImportPath(path: string): string {
  if (path.startsWith("@/")) {
    const p = path.slice(2);
    return `./${p}.js`;
  }

  return path;
}

function assertNever(x: never): never {
  throw new Error(`Unhandled statement tag: ${JSON.stringify(x)}`);
}
