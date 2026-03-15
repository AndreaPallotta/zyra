import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeEnvHelpers } from "../compiler/checkers/env.js";
import { T } from "../compiler/checkers/types.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeMatchVisitor } from "../compiler/checkers/match.js";

test("env.declare opts default behavior", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });
  const scope = new Map();

  env.declare(scope, "x", T.Int);
  const meta = scope.get("x");
  assert.ok(meta);
  assert.is(meta.used, false);
  assert.is(meta.isTopLevel, false);
  assert.is(meta.isExported, false);
});

test("env.declare opts override behavior", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });
  const scope = new Map();

  env.declare(scope, "y", T.Bool, { used: true, isTopLevel: true, isExported: true });
  const meta = scope.get("y");
  assert.ok(meta);
  assert.is(meta.used, true);
  assert.is(meta.isTopLevel, true);
  assert.is(meta.isExported, true);
});

test("Binary boolean operator with non-boolish operand emits diagnostic", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => ({ kind: "Int" } as any),
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

  const bex = {
    type: "BinaryExpr",
    operator: "&&",
    left: { type: "Identifier", name: "a", span: { start: 0, end: 0, line: 0, col: 0 } },
    right: { type: "Identifier", name: "b", span: { start: 0, end: 0, line: 0, col: 0 } },
    span: { start: 0, end: 0, line: 0, col: 0 },
  } as any;

  const res = visitor(bex, [], false, null);
  assert.ok(diags.length > 0);
  assert.ok((diags[0].message as string).toLowerCase().includes("boolean") || (diags[0].message as string).toLowerCase().includes("bool"));
  assert.ok(res.ty);
});

test("match: infer enum from arms and report non-exhaustive", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const variants = new Map();
  variants.set("Red", { payloadField: null, payloadType: null });
  variants.set("Green", { payloadField: null, payloadType: null });
  const enums = new Map();
  enums.set("Color", { variants });

  const visitExprStub = (_e: any, _stack: any, _inFn: boolean, _expected: any) => ({ ty: T.Unit, alwaysReturns: false });

  const mv = makeMatchVisitor({
    visitExpr: visitExprStub,
    envEnumOfIdent: new Map(),
    enums,
    joinConcreteOrError: core.joinConcreteOrError,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const matchExpr = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "x", span: { start: 0, end: 0, line: 0, col: 0 } },
    arms: [
      {
        pattern: {
          type: "VariantPattern",
          enumName: "Color",
          variant: "Red",
          payloadField: null,
          bind: null,
          span: { start: 0, end: 0, line: 0, col: 0 },
        },
        guard: null,
        body: { type: "IntLiteral", value: 1, span: { start: 0, end: 0, line: 0, col: 0 } },
        span: { start: 0, end: 0, line: 0, col: 0 },
      },
    ],
    span: { start: 0, end: 0, line: 0, col: 0 },
  } as any;

  const res = mv(matchExpr, [], false, null, true);
  assert.ok(res.ty);
  assert.ok(diags.length > 0);
  assert.ok(diags.some((d) => /Non-exhaustive|non-exhaustive/i.test(d.message)));
});

export const targetedSuite = test;
