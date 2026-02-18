import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isEffectfulExpr } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("VarDecl declares variable with effective type", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitExpr = () => ({ ty: T.Int, alwaysReturns: false });

  const sv = makeStmtVisitors({
    visitExpr,
    declare: (s: Map<any, any>, name: string, ty: any, opts?: any) => s.set(name, { ty, ...opts }),
    resolveTypeNode: () => T.Int,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr,
    use: () => T.Int,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  const scope = new Map();
  const stack = [scope];
  const st = { type: "VarDecl", name: "v", initializer: { type: "IntLiteral" }, typeAnn: null, isExported: false } as any;
  sv.visitStatement(st, stack, false, false, null, false);
  const entry = scope.get("v");
  assert.ok(entry);
  assert.is(entry.ty.kind, "Int");
});

test("Return outside function emits error", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Unit, alwaysReturns: false }),
    declare: () => {},
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
  });

  const scope = new Map();
  const res = sv.visitStatement({ type: "ReturnStmt", value: null } as any, [scope], false, false, null, false);
  assert.is(res.alwaysReturns, true);
  assert.ok((diags[0].message as string).includes("only allowed inside a function"));
});

test("ExpressionStmt useless expression emits diag", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Unit, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => false,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
  });

  const scope = new Map();
  sv.visitStatement({ type: "ExpressionStmt", expression: { type: "IntLiteral" } } as any, [scope], false, false, null, false);
  assert.ok((diags[0].message as string).includes("Useless expression statement"));
});

export const stmtsSuite = test;
