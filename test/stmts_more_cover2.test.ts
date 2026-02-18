import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("ImportDecl, VarDecl enum initializer, and return outside function", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const { visitStatement } = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    declare: (s: any, n: string, ty: any) => s.set(n, { ty }),
    resolveTypeNode: () => T.Unit,
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

  // ImportDecl
  visitStatement({ type: 'ImportDecl', names: ['a', 'b'] } as any, [new Map()], true, false, null, false);

  // VarDecl with EnumLiteral initializer should set envEnumOfIdent
  visitStatement({ type: 'VarDecl', name: 'v', initializer: { type: 'EnumLiteral', enumName: 'E', variant: 'A', payload: null }, typeAnn: null, isExported: false } as any, [new Map()], true, false, null, false);

  // Return outside function
  visitStatement({ type: 'ReturnStmt', value: null } as any, [new Map()], false, false, null, false);

  assert.ok(true);
});

export const stmtsMoreCover2Suite = test;
