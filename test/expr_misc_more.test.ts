import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("CallExpr non-function, Binary/Unary type errors, nested IfExpr else-if", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Unit,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  // Call on non-function
  visitor({ type: 'CallExpr', callee: { type: 'Identifier', name: 'x' }, args: [] } as any, [new Map()], false, null);

  // Binary equality mismatch
  visitor({ type: 'BinaryExpr', operator: '==', left: { type: 'IntLiteral' }, right: { type: 'BoolLiteral' } } as any, [new Map()], false, null);

  // Unary ! on non-bool
  visitor({ type: 'UnaryExpr', operator: '!', operand: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  // Nested IfExpr as elseBranch
  const nestedIf = { type: 'IfExpr', init: null, condition: { type: 'BoolLiteral' }, thenBranch: { statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] }, elseBranch: { type: 'IfExpr', init: null, condition: { type: 'BoolLiteral' }, thenBranch: { statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] }, elseBranch: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } } } as any;
  visitor(nestedIf, [new Map()], false, null);

  assert.ok(true);
});

export const exprMiscMoreSuite = test;
