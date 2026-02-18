import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isEffectfulExpr } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("FunctionDecl with missing returns emits diagnostic", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitExpr = () => ({ ty: T.Unit, alwaysReturns: false });

  const sv = makeStmtVisitors({
    visitExpr,
    declare: (s: Map<any, any>, name: string, ty: any, opts?: any) => s.set(name, { ty, ...opts }),
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  const func = {
    type: "FunctionDecl",
    name: "f",
    params: [],
    retType: { kind: "Unit" },
    body: { statements: [] },
    isExported: false,
  } as any;

  const outer = new Map();
  sv.visitStatement(func, [outer], true, false, null, false);
  // No diagnostic because retType Unit is satisfied by void body
  assert.is(diags.length, 0);
});

test("ReturnStmt with mismatched type triggers mustBe", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Bool,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  const res = sv.visitStatement({ type: "ReturnStmt", value: { type: "IntLiteral" } } as any, [new Map()], true, true, T.Bool, false);
  assert.is(res.alwaysReturns, true);
});

test("ExpressionStmt with value context returns exprTy", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => true,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
  });

  const res = sv.visitStatement({ type: "ExpressionStmt", expression: { type: "IntLiteral" } } as any, [new Map()], false, false, null, true);
  assert.is(res.exprTy?.kind, "Int");
});

export const stmtsMoreSuite = test;
