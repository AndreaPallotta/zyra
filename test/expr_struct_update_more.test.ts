import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("Struct literal unknown field and struct update unknown field", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const structs = new Map();
  structs.set("S", { fields: new Map([["a", { name: "a", type: T.Int }]]), name: "S" });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitor = makeExprVisitor({
    use: () => T.Struct('S'),
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
  const structLit = { type: "StructLiteral", name: "S", fields: [{ name: "b", value: { type: "IntLiteral" } }] } as any;
  visitor(structLit, [new Map()], false, null);

  const structUpdate = { type: "StructUpdateExpr", target: { type: "Identifier", name: "s" }, fields: [{ name: "b", value: { type: "IntLiteral" } }], typeAnn: { kind: 'Struct', name: 'S' } } as any;
  visitor(structUpdate, [new Map()], false, null);

  assert.ok(true);
});

export const exprStructUpdateMoreSuite = test;
