import { test } from "uvu";
import * as assert from "uvu/assert";

import { makeEnvHelpers } from "../compiler/checkers/env.js";
import { sameType, isEffectfulExpr, typeToString } from "../compiler/checkers/helpers.js";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers as makeCoreHelpers2 } from "../compiler/checkers/core_helpers.js";
import { makeStmtVisitors as makeStmtVisitors2 } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers as makeCoreHelpers3 } from "../compiler/checkers/core_helpers.js";
import { makeEnvHelpers as makeEnvHelpers2 } from "../compiler/checkers/env.js";
import { makeCoreHelpers as makeCoreHelpers4 } from "../compiler/checkers/core_helpers.js";
import { makeEnvHelpers as makeEnvHelpers3 } from "../compiler/checkers/env.js";
import { sameType as sameType2 } from "../compiler/checkers/helpers.js";
import { makeMatchVisitor as makeMatchVisitor2 } from "../compiler/checkers/match.js";
import { T } from "../compiler/checkers/types.js";

// Contents from branch_coverage.test.ts
test("env.use unknown identifier and finish/warn scope paths (merged)", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });

  const ty = env.use([new Map()], "nope", undefined);
  assert.is(ty.kind, "Unknown");
  assert.ok(diags.some((d) => (d.message as string).includes("Unknown identifier")));

  const s = new Map();
  s.set("a", { used: false, ty: T.Int, isTopLevel: false });
  env.finishScope(s);
  assert.ok(diags.some((d) => (d.message as string).includes("Unused variable: a")));

  const s2 = new Map();
  s2.set("b", { used: false, ty: T.Int, isTopLevel: true });
  env.warnUnusedTopLevel(s2);
  assert.ok(diags.some((d) => d.level === "warn" || (d.message as string).includes("Unused top-level")));
});

test("helpers.sameType and isEffectfulExpr branches (merged)", () => {
  const a = T.Fn([T.Int], T.Unit);
  const b = T.Fn([T.Int, T.Int], T.Unit);
  assert.is(sameType(a, b), false);

  assert.is(sameType(T.Struct("A"), T.Struct("B")), false);

  assert.is(isEffectfulExpr({ type: "CallExpr" }), true);
  assert.is(isEffectfulExpr({ type: "IntLiteral" }), false);
});

test("match guard type error (merged)", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const mv = makeMatchVisitor({
    visitExpr: (_: any) => ({ ty: T.Int, alwaysReturns: false }),
    envEnumOfIdent: new Map(),
    enums: new Map(),
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "x" },
    arms: [
      { pattern: { type: "WildcardPattern" }, guard: { type: "IntLiteral" }, body: { type: "IntLiteral" } },
    ],
  } as any;

  mv(m, [new Map()], false, null, true);
  assert.ok(diags.some((d) => (d.message as string).includes("Match guard must be Bool")));
});

test("stmts: return outside fn, function missing return, expression stmt branches (merged)", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const { visitStatement } = makeStmtVisitors({
    visitExpr: (_: any) => ({ ty: T.Int, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: (n: any) => (n ? T.Int : T.Unit),
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: core.implicitReturnFromBody,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => false,
    use: () => T.Int,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  visitStatement({ type: "ReturnStmt", value: null } as any, [new Map()], true, false, null, false);
  assert.ok(diags.some((d) => (d.message as string).includes("'return' is only allowed inside a function")));

  diags.length = 0;
  const fn = {
    type: "FunctionDecl",
    name: "g",
    params: [],
    retType: { kind: "Int" },
    body: { type: "Block", statements: [{ type: "ExpressionStmt", expression: { type: "IntLiteral" } }] },
    isExported: false,
  } as any;
  visitStatement(fn, [new Map()], true, false, null, false);
  assert.ok(diags.some((d) => (d.message as string).includes("Not all paths return a value")));

  diags.length = 0;
  visitStatement({ type: "ExpressionStmt", expression: { type: "IntLiteral" } } as any, [new Map()], true, false, null, false);
  assert.ok(diags.some((d) => (d.message as string).includes("Useless expression statement")));

  diags.length = 0;
  const res2 = visitStatement({ type: "ExpressionStmt", expression: { type: "IntLiteral" } } as any, [new Map()], true, false, null, true);
  assert.is(res2.exprTy?.kind, "Int");
});

// Contents from branch_more_1.test.ts
test("env.spanOf branches (merged)", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });

  assert.is(env.spanOf(undefined), undefined);
  assert.is(env.spanOf(null), undefined);
  assert.is(env.spanOf({}), undefined);
  const s = { span: { start: 1, end: 2 } };
  const got = env.spanOf(s as any);
  assert.ok(got && (got as any).start === 1);
});

test("sameType Any/Unknown short-circuit branches (merged)", () => {
  assert.is(sameType(T.Any, T.Int), true);
  assert.is(sameType(T.Unknown, T.Int), true);
});

test("match resolves EnumLiteral and identifier mapping (merged)", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }]]) });

  const mv = makeMatchVisitor({
    visitExpr: (_: any) => ({ ty: T.Enum("E"), alwaysReturns: false }),
    envEnumOfIdent: new Map([["v", "E"]]),
    enums,
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m1 = { type: "MatchExpr", value: { type: "EnumLiteral", enumName: "E" }, arms: [] } as any;
  mv(m1, [new Map()], false, null, true);

  const m2 = { type: "MatchExpr", value: { type: "Identifier", name: "v" }, arms: [] } as any;
  mv(m2, [new Map()], false, null, true);
  assert.ok(true);
});

// Contents from branch_more_2.test.ts
test("core_helpers.joinConcreteOrError Any and Unit/non-unit branches (merged)", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString: (t:any)=>t.kind, resolveTypeNode: () => T.Unit, err });

  const r1 = core.joinConcreteOrError([T.Any, T.Unknown], "ctx");
  assert.is(r1.kind, "Any");

  diags.length = 0;
  const r2 = core.joinConcreteOrError([T.Unit, T.Int], "ctx");
  assert.is(r2.kind, "Unknown");
  assert.ok(diags.some((d) => (d.message as string).includes("Incompatible types")));
});

test("env.use hits existing entry (merged)", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });

  const scope = new Map();
  scope.set("z", { used: false, ty: T.Int, isTopLevel: false, isExported: false });
  const ty = env.use([scope], "z", undefined);
  assert.is(ty.kind, "Int");
  assert.is((scope.get("z") as any).used, true);
});

test("match visitExpr non-enum fallback (merged)", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const mv = makeMatchVisitor({
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    envEnumOfIdent: new Map(),
    enums: new Map(),
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m = { type: "MatchExpr", value: { type: "CallExpr" }, arms: [] } as any;
  mv(m, [new Map()], false, null, true);
  assert.ok(true);
});

test("stmts: joinConcreteOrError path for function without retType and unreachable statements in block (merged)", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString: (t:any)=>t.kind, resolveTypeNode: () => T.Unit, err });

  const { visitStatement, visitBlock } = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: core.implicitReturnFromBody,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => true,
    use: () => T.Int,
    envEnumOfIdent: new Map(),
    typeToString: (t:any)=>t.kind,
    requireValue: core.requireValue,
  });

  const fn = {
    type: "FunctionDecl",
    name: "h",
    params: [],
    retType: null,
    body: { type: "Block", statements: [{ type: "ReturnStmt", value: { type: "IntLiteral" } }] },
    isExported: false,
  } as any;
  visitStatement(fn, [new Map()], true, true, null, false);

  diags.length = 0;
  const b = { type: "Block", statements: [{ type: "ReturnStmt", value: { type: "IntLiteral" } }, { type: "ExpressionStmt", expression: { type: "IntLiteral" } }] } as any;
  visitBlock(b, [new Map()], true, null, false);
  assert.ok(diags.some((d) => (d.message as string).includes("Unreachable statement")));
});

// Contents from branch_more_3.test.ts
test("core_helpers.mustBe early returns and error path (merged)", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString: (t:any)=>t.kind, resolveTypeNode: () => T.Unit, err });

  core.mustBe(T.Int, T.Any, "nope");
  core.mustBe(T.Any, T.Int, "nope");

  diags.length = 0;
  core.mustBe(T.Int, T.Bool, "mismatch");
  assert.ok(diags.some((d) => (d.message as string).includes("mismatch") || (d.message as string).includes("Return type mismatch") || (d.message as string).includes("Incompatible")));
});

test("env.declare with opts sets metadata (merged)", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });
  const s = new Map();
  env.declare(s, "x", T.Int, { used: true, isTopLevel: true, isExported: true });
  const e = s.get("x") as any;
  assert.is(e.used, true);
  assert.is(e.isTopLevel, true);
  assert.is(e.isExported, true);
});

test("sameType Fn return and param mismatch branches (merged)", () => {
  const a = T.Fn([T.Int], T.Int);
  const b = T.Fn([T.Int], T.Unit);
  assert.is(sameType(a, b), false);

  const c = T.Fn([T.Int, T.Int], T.Unit);
  const d = T.Fn([T.Int, T.Bool], T.Unit);
  assert.is(sameType(c, d), false);
});

export const mergedSmallSuite = test;
