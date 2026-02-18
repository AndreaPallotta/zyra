import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("EnumLiteral unknown enum emits error", () => {
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

  const lit = { type: "EnumLiteral", enumName: "Nope", variant: "A", payload: null } as any;
  const res = visitor(lit, [], false, null);
  assert.is(res.ty.kind, "Unknown");
  assert.ok(diags.some((d) => (d.message as string).includes("Unknown enum")));
});

test("EnumLiteral payload mismatch emits errors", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const defs = new Map();
  defs.set("A", { payloadField: null, payloadType: null });
  const enums = new Map();
  enums.set("E", { variants: defs });

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
    enums,
    visitBlock: () => ({ ty: T.Unit, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Unit }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  const lit = { type: "EnumLiteral", enumName: "E", variant: "A", payload: { type: "IntLiteral" } } as any;
  visitor(lit, [], false, null);
  assert.ok(diags.some((d) => (d.message as string).includes("takes no arguments")));
});

export const enumSuite = test;
