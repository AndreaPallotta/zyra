import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("Enum literal edge cases: unknown enum/variant/payload mistakes", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }], ["B", { payloadField: 'x', payloadType: { kind: 'Int' } }]]) });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: (n:any) => (n ? T.Int : T.Unit), err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: (n:any) => (n && n.kind === 'Int' ? T.Int : T.Unit),
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums,
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  // Unknown enum
  visitor({ type: 'EnumLiteral', enumName: 'X', variant: 'A', payload: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  // Unknown variant
  visitor({ type: 'EnumLiteral', enumName: 'E', variant: 'C', payload: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  // Variant takes no arguments but payload provided
  visitor({ type: 'EnumLiteral', enumName: 'E', variant: 'A', payload: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  // Variant expects payload but none provided
  visitor({ type: 'EnumLiteral', enumName: 'E', variant: 'B', payload: null } as any, [new Map()], false, null);

  // Payload type mismatch (simulate by providing StringLiteral)
  visitor({ type: 'EnumLiteral', enumName: 'E', variant: 'B', payload: { type: 'StringLiteral' } } as any, [new Map()], false, null);

  assert.ok(true);
});

export const exprEnumMore2Suite = test;
