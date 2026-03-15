import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("StructLiteral unknown struct emits error and visits fields", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Int,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums: new Map(),
    visitBlock: () => ({ ty: T.Unit, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Unit }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  const lit = { type: "StructLiteral", name: "P", fields: [{ name: "x", value: { type: "IntLiteral" } }] } as any;
  const res = visitor(lit, [], false, null);
  assert.is(res.ty.kind, "Unknown");
  assert.ok((diags[0].message as string).includes("Unknown struct"));
});

test("StructLiteral duplicate and missing fields emit errors", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const defs = new Map();
  defs.set("x", null);
  defs.set("y", null);
  const structs = new Map();
  structs.set("P", { fields: defs });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Int,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs,
    enums: new Map(),
    visitBlock: () => ({ ty: T.Unit, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Unit }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  const litDup = { type: "StructLiteral", name: "P", fields: [{ name: "x", value: { type: "IntLiteral" } }, { name: "x", value: { type: "IntLiteral" } }] } as any;
  visitor(litDup, [], false, null);
  assert.ok(diags.some((d) => (d.message as string).includes("Duplicate field")));

  diags.length = 0;
  const litMiss = { type: "StructLiteral", name: "P", fields: [{ name: "x", value: { type: "IntLiteral" } }] } as any;
  visitor(litMiss, [], false, null);
  assert.ok(diags.some((d) => (d.message as string).includes("Missing field")));
});

export const structSuite = test;
