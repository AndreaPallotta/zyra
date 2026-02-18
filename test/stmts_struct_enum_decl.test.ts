import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("StructDecl and EnumDecl noop path in visitStatement", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const { visitStatement } = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    declare: () => {},
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

  visitStatement({ type: 'StructDecl', name: 'S', fields: [] } as any, [new Map()], true, false, null, false);
  visitStatement({ type: 'EnumDecl', name: 'E', variants: [] } as any, [new Map()], true, false, null, false);

  assert.ok(true);
});

export const stmtsStructEnumDeclSuite = test;
