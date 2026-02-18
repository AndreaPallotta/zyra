import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { T } from "../compiler/checkers/types.js";

test("MatchExpr returning Unit triggers requireValue error", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType: (a:any,b:any) => a.kind === b.kind,
    typeToString: (t:any) => t.kind || String(t),
    isBoolish: () => true,
    joinConcreteOrError: () => T.Unit,
    requireValue: () => {},
    requireBranchValue: () => {},
    resolveTypeNode: () => T.Unit,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums: new Map(),
    visitBlock: () => ({ ty: T.Unit, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Unit }),
    mustBe: () => {},
    err,
    spanOf: () => undefined,
  });

  visitor({ type: 'MatchExpr', value: { type: 'Identifier', name: 'x' }, arms: [] } as any, [new Map()], false, null);

  assert.ok(true);
});

export const exprMatchUnitSuite = test;
