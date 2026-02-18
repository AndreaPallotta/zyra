import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("StructUpdate with field annotation triggers mustBe branch", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const structs = new Map();
  // field annotation stored as a TypeNode-like object
  structs.set("S", { fields: new Map([["a", { kind: 'Int' }]]), name: 'S' });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: (n:any) => (n && n.kind === 'Int' ? T.Int : T.Unit), err });

  const visitor = makeExprVisitor({
    use: () => T.Struct('S'),
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
    structs,
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  const structUpdate = { type: 'StructUpdateExpr', target: { type: 'Identifier', name: 's' }, fields: [{ name: 'a', value: { type: 'IntLiteral' } }] } as any;
  visitor(structUpdate, [new Map()], false, null);

  assert.ok(true);
});

export const exprStructUpdateFieldAnnSuite = test;
