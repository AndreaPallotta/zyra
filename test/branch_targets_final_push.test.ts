import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeEnvHelpers } from "../compiler/checkers/env.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("env.declare variants to hit nullish branches", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });
  const s = new Map();

  env.declare(s, "a", T.Int);
  env.declare(s, "b", T.Int, { used: true });
  env.declare(s, "c", T.Int, { used: undefined as any });

  assert.is(s.get("a").used, false);
  assert.is(s.get("b").used, true);
  // when provided but undefined, property exists; ensure no crash
  assert.is(s.get("c").used, false);
});

test("stmts: function param declaration loop executes", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const sv = makeStmtVisitors({
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

  const fnDecl = {
    type: "FunctionDecl",
    name: "g",
    params: [{ name: "p", typeAnn: { type: "NamedType", name: "Int" } }],
    retType: null,
    body: { type: "Block", statements: [] },
    isExported: false,
  } as any;

  const res = sv.visitStatement(fnDecl, [new Map()], true, false, null, false);
  assert.ok(res);
});

test("match: enumName truthy path and per-arm lookup", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const variants = new Map();
  variants.set("X", { payloadField: null, payloadType: null });
  const enums = new Map();
  enums.set("M", { variants });

  const mv = makeMatchVisitor({
    visitExpr: () => ({ ty: T.Enum("M"), alwaysReturns: false }),
    envEnumOfIdent: new Map(),
    enums,
    joinConcreteOrError: (_tys: any) => T.Unit,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const matchExpr = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "someEnum" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "M", variant: "X", payloadField: null, bind: null }, guard: null, body: { type: "IntLiteral", value: 1 } },
    ],
  } as any;

  const res = mv(matchExpr, [new Map()], false, null, true);
  assert.ok(res.ty);
});

export const branchTargetsFinalPush = test;
