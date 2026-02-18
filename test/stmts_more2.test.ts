import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isEffectfulExpr } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("PrintStmt requires value for args", () => {
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
    isEffectfulExpr,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  sv.visitStatement({ type: "PrintStmt", args: [{ type: "UnitLiteral" }] } as any, [new Map()], false, false, null, false);
  assert.ok(diags.length >= 1);
});

test("VarDecl with EnumLiteral sets envEnumOfIdent", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const envEnumOfIdent = new Map<string,string>();
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Enum("E"), alwaysReturns: false }),
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
    envEnumOfIdent,
    typeToString,
    requireValue: core.requireValue,
  });

  const scope = new Map();
  sv.visitStatement({ type: "VarDecl", name: "v", initializer: { type: "EnumLiteral", enumName: "E", variant: "A", payload: null }, typeAnn: null, isExported: false } as any, [scope], false, false, null, false);
  assert.ok(envEnumOfIdent.get("v") === "E");
});

export const stmtsMore2Suite = test;
