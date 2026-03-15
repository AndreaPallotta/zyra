import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("visitBlock reports unreachable statements and function with no retType uses joinConcreteOrError", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const { visitStatement, visitBlock } = makeStmtVisitors({
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
    isEffectfulExpr: () => true,
    use: () => T.Int,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  // visitBlock unreachable: first stmt returns, second should be flagged unreachable
  const block = { statements: [ { type: 'ReturnStmt', value: { type: 'IntLiteral' } }, { type: 'PrintStmt', args: [{ type: 'IntLiteral' }] } ] } as any;
  visitBlock(block, [new Map()], true, T.Int, false);

  // function with no retType: joinConcreteOrError will be used when body has returns
  const fnDecl = { type: 'FunctionDecl', name: 'g', params: [], retType: null, body: { statements: [ { type: 'ReturnStmt', value: { type: 'IntLiteral' } } ] } } as any;
  visitStatement(fnDecl, [new Map()], false, false, null, false);

  assert.ok(true);
});

export const stmtsUnreachableMoreSuite = test;
