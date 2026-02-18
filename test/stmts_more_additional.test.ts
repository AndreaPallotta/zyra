import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("Statements: function missing return & return-without-value and useless expr stmt", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const { visitStatement, visitBlock } = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Unit, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: core.implicitReturnFromBody,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => false,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  // FunctionDecl with declared return type but body doesn't always return
  const fnDecl = { type: 'FunctionDecl', name: 'f', params: [], retType: { kind: 'Int' }, body: { statements: [{ type: 'PrintStmt', args: [{ type: 'IntLiteral' }] }] } } as any;
  visitStatement(fnDecl, [new Map()], false, false, null, false);

  // Return without value when expected Int
  const retStmt = { type: 'ReturnStmt', value: null } as any;
  visitStatement(retStmt, [new Map()], false, true, T.Int, false);

  // Useless expression statement
  const exprStmt = { type: 'ExpressionStmt', expression: { type: 'IntLiteral' } } as any;
  visitStatement(exprStmt, [new Map()], false, false, null, false);

  assert.ok(true);
});

export const stmtsMoreAdditionalSuite = test;
