import type { Span } from "./span.js";
import {
  Program,
  Statement,
  Expression,
  Block,
  MatchExpr,
  MatchArm,
  TypeNode,
  Pattern,
} from "./ast.js";

export type Diagnostic = {
  level: "error" | "warn";
  message: string;
  span?: Span;
};
import {
  StructInfo,
  EnumInfo,
  Ty,
  T,
  ScopeEntry,
  Scope,
  StmtResult,
  BlockResult,
} from "./checkers/types.js";
import { sameType, typeToString, isBoolish, isEffectfulExpr } from "./checkers/helpers.js";
import { makeCoreHelpers } from "./checkers/core_helpers.js";
import { makeEnvHelpers } from "./checkers/env.js";
import { makeMatchVisitor } from "./checkers/match.js";
import { makeExprVisitor } from "./checkers/expr.js";
import { makeStmtVisitors } from "./checkers/stmts.js";

/**
 * Run semantic checks over the given `program` and return diagnostics.
 * This function contains the core checking flow; auxiliary helpers
 * are delegated to files under `compiler/checkers/` to keep this file
 * focused on high-level logic.
 */
export function check(program: Program): Diagnostic[] {
  const diags: Diagnostic[] = [];

  const structs = new Map<string, StructInfo>();
  const enums = new Map<string, EnumInfo>();

  const env = makeEnvHelpers({ diags, T });
  const err = env.err;
  const warn = env.warn;
  const spanOf = env.spanOf;
  const declare = env.declare;
  const use = env.use;
  const finishScope = env.finishScope;
  const warnUnusedTopLevel = env.warnUnusedTopLevel;

  for (const st of program.body) {
    if (st.type === "StructDecl") {
      const reserved = new Set(["__t", "__e", "__c"]);
      const fmap = new Map<string, TypeNode | null>();

      for (const f of st.fields) {
        if (reserved.has(f.name))
          err(`Struct ${st.name}: field '${f.name}' is reserved`, spanOf(f));
        if (fmap.has(f.name))
          err(`Struct ${st.name}: duplicate field '${f.name}'`, spanOf(f));
        fmap.set(f.name, f.typeAnn ?? null);
      }
      structs.set(st.name, { fields: fmap });
    }

    if (st.type === "EnumDecl") {
      const vmap = new Map<
        string,
        { payloadField: string | null; payloadType: TypeNode | null }
      >();
      for (const v of st.variants) {
        vmap.set(v.name, {
          payloadField: v.payloadField,
          payloadType: v.payloadType ?? null,
        });
      }
      enums.set(st.name, { variants: vmap });
    }
  }

  const globalScope: Scope = new Map();
  const envEnumOfIdent = new Map<string, string>();

  // scope and diagnostic helpers are provided by `env` below

  function resolveTypeNode(n: TypeNode | null): Ty {
    if (!n) return T.Unknown;
    if (n.type === "AnyType") return T.Any;

    const name = n.name;

    if (name === "Int") return T.Int;
    if (name === "Bool") return T.Bool;
    if (name === "String") return T.String;
    if (name === "Unit") return T.Unit;
    if (structs.has(name)) return T.Struct(name);
    if (enums.has(name)) return T.Enum(name);

    err(`Unknown type: ${name}`, spanOf(n));
    return T.Unknown;
  }

  function sameType(a: Ty, b: Ty): boolean {
    if (a.kind === "Any" || b.kind === "Any") return true;
    if (a.kind === "Unknown" || b.kind === "Unknown") return true;
    if (a.kind !== b.kind) return false;

    if (a.kind === "Struct" || a.kind === "Enum")
      return a.name === (b as any).name;

    if (a.kind === "Fn") {
      const fb = b as any as Ty & { kind: "Fn" };
      if (a.params.length !== fb.params.length) return false;
      if (!sameType(a.ret, fb.ret)) return false;
      for (let i = 0; i < a.params.length; i++) {
        if (!sameType(a.params[i], fb.params[i])) return false;
      }
      return true;
    }
    return true;
  }

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode, err });
  const mustBe = core.mustBe;
  const joinConcreteOrError = core.joinConcreteOrError;
  const requireValue = core.requireValue;
  const requireBranchValue = core.requireBranchValue;
  const implicitReturnFromBody = core.implicitReturnFromBody;

  function visitProgram() {
    const stack: Scope[] = [globalScope];

    for (const st of program.body) {
      if (st.type === "ReturnStmt") {
        err(`'return' is not allowed at top-level`, spanOf(st));
        continue;
      }
      visitStatement(st, stack, true, false, null, false);
    }

    finishScope(globalScope);
    warnUnusedTopLevel(globalScope);
  }

  let visitExpr: (e: Expression, stack: Scope[], inFn: boolean, expectedFnRet: Ty | null) => { ty: Ty; alwaysReturns: boolean };
  let visitStatement: (st: Statement, stack: Scope[], isTopLevel: boolean, inFn: boolean, expectedFnRet: Ty | null, allowValueExprStmt: boolean) => StmtResult;
  let visitBlock: (b: Block, stack: Scope[], inFn: boolean, expectedFnRet: Ty | null, valueContext: boolean) => BlockResult;

  const visitMatch = makeMatchVisitor({
    visitExpr: (e: Expression, stack: Scope[], inFn: boolean, expectedFnRet: Ty | null) => visitExpr(e, stack, inFn, expectedFnRet),
    envEnumOfIdent,
    enums,
    joinConcreteOrError,
    err,
    spanOf,
    finishScope,
    declare,
    resolveTypeNode,
  });

  const stmtVisitors = makeStmtVisitors({
    visitExpr: (e: Expression, stack: Scope[], inFn: boolean, expectedFnRet: Ty | null) => visitExpr(e, stack, inFn, expectedFnRet),
    declare,
    resolveTypeNode,
    mustBe,
    T,
    joinConcreteOrError,
    implicitReturnFromBody,
    finishScope,
    err,
    spanOf,
    isEffectfulExpr,
    use,
    envEnumOfIdent,
    typeToString,
    requireValue,
  });
  visitStatement = stmtVisitors.visitStatement;
  visitBlock = stmtVisitors.visitBlock;

  visitExpr = makeExprVisitor({
    use,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError,
    requireValue,
    requireBranchValue,
    resolveTypeNode,
    declare,
    envEnumOfIdent,
    structs,
    enums,
    visitBlock: (b: Block, stack: Scope[], inFn: boolean, expectedFnRet: Ty | null, valueContext: boolean) => visitBlock(b, stack, inFn, expectedFnRet, valueContext),
    visitMatch: (m: MatchExpr, stack: Scope[], inFn: boolean, expectedFnRet: Ty | null, valueContext: boolean) => visitMatch(m, stack, inFn, expectedFnRet, valueContext),
    err,
    spanOf,
  });

  visitProgram();
  return diags;
}
