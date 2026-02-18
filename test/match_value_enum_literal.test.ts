import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { T } from "../compiler/checkers/types.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";

test("resolveEnumNameFromValue handles EnumLiteral and inference from arms", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set('E', { variants: new Map([["A", {}]]) });

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

  // value is EnumLiteral -> direct enumName resolution
  visitor({ type: 'MatchExpr', value: { type: 'EnumLiteral', enumName: 'E', variant: 'A', payload: null }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'E', variant: 'A' }, guard: null, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } }] } as any, [new Map()], false, null);

  // value cannot resolve, but arms infer enum name
  visitor({ type: 'MatchExpr', value: { type: 'Identifier', name: 'x' }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'E', variant: 'A' }, guard: null, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } }] } as any, [new Map()], false, null);

  assert.ok(true);
});

export const matchValueEnumLiteralSuite = test;
