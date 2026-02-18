import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isEffectfulExpr } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("FunctionDecl missing non-Unit returns emits diagnostic", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitExpr = () => ({ ty: T.Unit, alwaysReturns: false });

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
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  const func = {
    type: "FunctionDecl",
    name: "f",
    params: [],
    retType: { kind: "Int" },
    body: { statements: [] },
    isExported: false,
  } as any;

  sv.visitStatement(func, [new Map()], true, false, null, false);
  assert.ok(diags.some((d) => (d.message as string).includes("Not all paths return a value")));
});

test("ReturnStmt without value when expecting non-Unit emits diag", () => {
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

  const res = sv.visitStatement({ type: "ReturnStmt", value: null } as any, [new Map()], false, true, T.Int, false);
  assert.ok(diags.some((d) => (d.message as string).includes("Return value required")));
});

export const stmtsMore3Suite = test;
