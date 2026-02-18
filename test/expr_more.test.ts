import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("InterpString checks embedded exprs for value", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => T.Unit,
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

  const interp = { type: "InterpString", parts: [{ type: "Literal", value: "a" }, { type: "Expr", expr: { type: "Identifier", name: "x" } }] } as any;
  visitor(interp, [], false, null);
  assert.ok(diags.length === 1);
});

test("Unary '!' reports when operand not boolish", () => {
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

  const u = { type: "UnaryExpr", operator: "!", operand: { type: "Identifier", name: "a" } } as any;
  const r = visitor(u, [], false, null);
  assert.is(r.ty.kind, "Bool");
  assert.is(diags.length, 1);
});

test("Binary comparison and equality emit diagnostics on bad types", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => ({ kind: "String" } as any),
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

  const cmp = { type: "BinaryExpr", operator: "<", left: { type: "Identifier", name: "a" }, right: { type: "Identifier", name: "b" } } as any;
  const eq = { type: "BinaryExpr", operator: "==", left: { type: "Identifier", name: "a" }, right: { type: "Identifier", name: "b" } } as any;
  visitor(cmp, [], false, null);
  visitor(eq, [], false, null);
  assert.ok(diags.length >= 1);
});

test("CallExpr wrong arg count and type mismatch produce diagnostics", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const calleeTy = T.Fn([T.Int, T.Bool], T.String);
  const visitor = makeExprVisitor({
    use: (s: any, name: string) => (name === "f" ? calleeTy : T.String),
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

  const callBadCount = { type: "CallExpr", callee: { type: "Identifier", name: "f" }, args: [{ type: "IntLiteral" }] } as any;
  visitor(callBadCount, [], false, null);

  const callBadType = { type: "CallExpr", callee: { type: "Identifier", name: "f" }, args: [{ type: "StringLiteral" }, { type: "IntLiteral" }] } as any;
  visitor(callBadType, [], false, null);

  assert.ok(diags.length >= 2);
});

export const exprMoreSuite = test;
