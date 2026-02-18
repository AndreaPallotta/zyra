import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("EnumLiteral unknown variant and payload argument cases", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }]]) });

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

  // unknown variant
  diags.length = 0;
  visitor({ type: "EnumLiteral", enumName: "E", variant: "B", payload: null } as any, [], false, null);
  assert.ok(diags.some((d) => (d.message as string).includes("Unknown variant")));

  // variant takes no args but payload provided
  diags.length = 0;
  visitor({ type: "EnumLiteral", enumName: "E", variant: "A", payload: { type: "IntLiteral" } } as any, [], false, null);
  assert.ok(diags.some((d) => (d.message as string).includes("takes no arguments")));
});

test("EnumLiteral expects payload when variant requires it and type mismatch triggers mustBe", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const variants = new Map();
  variants.set("B", { payloadField: "p", payloadType: { kind: "Bool" } });
  const enums = new Map();
  enums.set("E2", { variants });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Bool, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: (n:any) => (n && n.kind === 'Bool' ? T.Bool : T.Unit),
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

  diags.length = 0;
  // missing payload
  visitor({ type: "EnumLiteral", enumName: "E2", variant: "B", payload: null } as any, [], false, null);
  assert.ok(diags.some((d) => (d.message as string).includes("expects 1 argument")));

  diags.length = 0;
  // payload present but wrong type -> mustBe should report
  visitor({ type: "EnumLiteral", enumName: "E2", variant: "B", payload: { type: "IntLiteral" } } as any, [], false, null);
  assert.ok(diags.length >= 1);
});

export const exprEnumMoreSuite = test;
