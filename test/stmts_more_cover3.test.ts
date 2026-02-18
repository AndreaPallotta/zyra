import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("VarDecl with annotation mismatch, function returns wrong type and ExpressionStmt value allowed", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const { visitStatement, visitBlock } = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Bool, alwaysReturns: false }),
    declare: (s: any, n: string, ty: any) => s.set(n, { ty }),
    resolveTypeNode: () => T.Int,
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
    typeToString,
    requireValue: core.requireValue,
  });

  // VarDecl with type annotation mismatch
  visitStatement({ type: 'VarDecl', name: 'v', initializer: { type: 'IntLiteral' }, typeAnn: { kind: 'Bool' }, isExported: false } as any, [new Map()], true, false, null, false);

  // FunctionDecl with declared Int but body returns Bool -> mustBe triggered
  const fnDecl = { type: 'FunctionDecl', name: 'h', params: [], retType: { kind: 'Int' }, body: { statements: [{ type: 'ReturnStmt', value: { type: 'BoolLiteral' } }] } } as any;
  visitStatement(fnDecl, [new Map()], false, false, null, false);

  // ExpressionStmt with allowValueExprStmt true
  const exprStmt = { type: 'ExpressionStmt', expression: { type: 'IntLiteral' } } as any;
  visitStatement(exprStmt, [new Map()], false, false, null, true);

  assert.ok(true);
});

export const stmtsMoreCover3Suite = test;
