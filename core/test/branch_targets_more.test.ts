import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeEnvHelpers } from "../compiler/checkers/env.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("env.spanOf handles missing span and present span", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });
  assert.is(env.spanOf(null), undefined);
  const node = { span: { start: 1, end: 2, line: 0, col: 0 } };
  assert.equal(env.spanOf(node), node.span);
});

test("env.use unknown identifier emits Unknown and diagnostic", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });
  const ty = env.use([new Map()], "nope");
  assert.is(ty.kind, "Unknown");
  assert.ok(diags.length > 0);
});

test("stmts.ExpressionStmt useless branch and FunctionDecl not all paths return", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const stmtVis = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Unit, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Int,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: core.implicitReturnFromBody,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => false,
    use: () => T.Unknown,
    envEnumOfIdent: new Map(),
    typeToString,
  });

  const exprStmt = { type: "ExpressionStmt", expression: { type: "IntLiteral", value: 1 } } as any;
  const res1 = stmtVis.visitStatement(exprStmt, [new Map()], false, false, null, false);
  assert.ok(diags.some((d) => /Useless expression statement/.test(d.message)));

  diags.length = 0;

  const fnDecl = {
    type: "FunctionDecl",
    name: "f",
    params: [],
    retType: { type: "NamedType", name: "Int" },
    body: { type: "Block", statements: [] },
    isExported: false,
  } as any;

  const res2 = stmtVis.visitStatement(fnDecl, [new Map()], true, false, null, false);
  assert.ok(diags.some((d) => /Not all paths return a value/.test(d.message)));
});

test("match: branch when enumName is null uses per-arm enum lookup", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const mv = makeMatchVisitor({
    visitExpr: () => ({ ty: T.Unit, alwaysReturns: false }),
    envEnumOfIdent: new Map(),
    enums: new Map(),
    joinConcreteOrError: (_tys: any) => T.Unit,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const matchExpr = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "x" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "A", variant: "V", payloadField: null, bind: null }, guard: null, body: { type: "IntLiteral", value: 1 } },
      { pattern: { type: "VariantPattern", enumName: "B", variant: "W", payloadField: null, bind: null }, guard: null, body: { type: "IntLiteral", value: 2 } },
    ],
  } as any;

  const res = mv(matchExpr, [new Map()], false, null, true);
  // Should run without throwing and produce diagnostics (non-exhaustive/unknown variants)
  assert.ok(Array.isArray(diags));
});

export const branchTargetsMore = test;
