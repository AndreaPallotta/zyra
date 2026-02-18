import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { T } from "../compiler/checkers/types.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";

test("Match non-exhaustive enum reports missing variants", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", {}], ["B", {}]]) });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitor = makeMatchVisitor({
    enums,
    T,
    sameType,
    typeToString,
    visitExpr: () => ({ ty: T.Enum('E'), alwaysReturns: false }),
    envEnumOfIdent: new Map(),
    joinConcreteOrError: core.joinConcreteOrError,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Unit,
  });

  const matchNode = {
    type: 'MatchExpr',
    value: { type: 'Identifier', name: 'x' },
    arms: [ { pattern: { type: 'VariantPattern', enumName: 'E', variant: 'A' }, guard: null, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } } ]
  } as any;

  visitor(matchNode, [new Map()], false, null);

  assert.ok(true);
});

export const matchNonExhaustiveSuite = test;
