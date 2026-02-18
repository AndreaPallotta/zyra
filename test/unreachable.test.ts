import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isEffectfulExpr } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("Unreachable statement emits diagnostic", () => {
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
  });

  const scope = new Map();
  const block = {
    statements: [
      { type: "ReturnStmt", value: null },
      { type: "VarDecl", name: "x", initializer: { type: "IntLiteral" }, typeAnn: null, isExported: false },
    ],
  } as any;

  const res = sv.visitBlock(block, [scope], false, null, false);
  assert.ok(diags.some((d) => (d.message as string).includes("Unreachable statement")));
});

export const unreachableSuite = test;
