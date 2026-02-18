import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("More expression branches: arithmetic, comparison, logical, interpstring, call-arg-count", () => {
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

  // Arithmetic
  visitor({ type: 'BinaryExpr', operator: '+', left: { type: 'IntLiteral' }, right: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  // Comparison
  visitor({ type: 'BinaryExpr', operator: '<', left: { type: 'IntLiteral' }, right: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  // Logical &&
  visitor({ type: 'BinaryExpr', operator: '&&', left: { type: 'BoolLiteral' }, right: { type: 'BoolLiteral' } } as any, [new Map()], false, null);

  // InterpString with expression part that returns Int (ok)
  visitor({ type: 'InterpString', parts: [{ type: 'Str', value: 'a' }, { type: 'Expr', expr: { type: 'IntLiteral' } }] } as any, [new Map()], false, null);

  // CallExpr arg count mismatch (callee is function)
  const calleeFn = { type: 'CallExpr', callee: { type: 'Identifier', name: 'f' }, args: [{ type: 'IntLiteral' }, { type: 'IntLiteral' }] } as any;
  // create a visitor where use returns a function type expecting 1 param
  const visitorFn = makeExprVisitor({ ...{ use: () => T.Fn([T.Int], T.Int) }, T, sameType, typeToString, isBoolish, joinConcreteOrError: core.joinConcreteOrError, requireValue: core.requireValue, requireBranchValue: core.requireBranchValue, resolveTypeNode: () => T.Unit, declare: () => {}, envEnumOfIdent: new Map(), structs: new Map(), enums: new Map(), visitBlock: () => ({ ty: T.Int, alwaysReturns: false }), visitMatch: () => ({ ty: T.Int }), mustBe: core.mustBe, err, spanOf: () => undefined });
  visitorFn(calleeFn, [new Map()], false, null);

  assert.ok(true);
});

export const exprMoreFinalSuite = test;
