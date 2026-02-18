import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("Struct literal duplicate/missing fields and update target errors", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const structs = new Map();
  structs.set("S", { fields: new Map([["a", { name: "a", type: { kind: 'Int' } }], ["b", { name: 'b', type: { kind: 'Int' } }]]), name: 'S' });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  // Duplicate field
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
    structs,
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  visitor({ type: 'StructLiteral', name: 'S', fields: [{ name: 'a', value: { type: 'IntLiteral' } }, { name: 'a', value: { type: 'IntLiteral' } }] } as any, [new Map()], false, null);

  // Missing field 'b'
  visitor({ type: 'StructLiteral', name: 'S', fields: [{ name: 'a', value: { type: 'IntLiteral' } }] } as any, [new Map()], false, null);

  // StructUpdate: target not a struct
  const visitorNonStruct = makeExprVisitor({ ...{ use: () => T.Int }, T, sameType, typeToString, isBoolish, joinConcreteOrError: core.joinConcreteOrError, requireValue: core.requireValue, requireBranchValue: core.requireBranchValue, resolveTypeNode: () => T.Unit, declare: () => {}, envEnumOfIdent: new Map(), structs, enums: new Map(), visitBlock: () => ({ ty: T.Int, alwaysReturns: false }), visitMatch: () => ({ ty: T.Int }), mustBe: core.mustBe, err, spanOf: () => undefined });

  visitorNonStruct({ type: 'StructUpdateExpr', target: { type: 'Identifier', name: 'x' }, fields: [{ name: 'a', value: { type: 'IntLiteral' } }] } as any, [new Map()], false, null);

  // StructUpdate: unknown struct name on target type
  const visitorUnknownStruct = makeExprVisitor({ ...{ use: () => T.Struct('X') }, T, sameType, typeToString, isBoolish, joinConcreteOrError: core.joinConcreteOrError, requireValue: core.requireValue, requireBranchValue: core.requireBranchValue, resolveTypeNode: () => T.Unit, declare: () => {}, envEnumOfIdent: new Map(), structs, enums: new Map(), visitBlock: () => ({ ty: T.Int, alwaysReturns: false }), visitMatch: () => ({ ty: T.Int }), mustBe: core.mustBe, err, spanOf: () => undefined });

  visitorUnknownStruct({ type: 'StructUpdateExpr', target: { type: 'Identifier', name: 's' }, fields: [{ name: 'a', value: { type: 'IntLiteral' } }] } as any, [new Map()], false, null);

  assert.ok(true);
});

export const exprStructMore2Suite = test;
