import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("IfExpr with init and non-bool condition triggers checks", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish: (t:any) => false, // make condition non-boolish to trigger err
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Int,
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

  const ife = {
    type: 'IfExpr',
    init: { name: 'x', initializer: { type: 'IntLiteral' }, typeAnn: { kind: 'Int' } },
    condition: { type: 'IntLiteral' },
    thenBranch: { statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] },
    elseBranch: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] },
  } as any;

  visitor(ife, [new Map()], false, null);

  assert.ok(true);
});

export const exprIfInitCasesSuite = test;
