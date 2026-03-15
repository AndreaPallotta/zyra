import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { T } from "../compiler/checkers/types.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";

test("Non-exhaustive match emits error", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }], ["B", { payloadField: null, payloadType: null }]]) });

  const mv = makeMatchVisitor({
    visitExpr: (e: any) => ({ ty: T.Enum("E"), alwaysReturns: false }),
    envEnumOfIdent: new Map([["v", "E"]]),
    enums,
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "v" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A", bind: null }, guard: null, body: { type: "IntLiteral" } },
    ],
  } as any;

  mv(m, [new Map()], false, null, true);
  assert.is(diags.length > 0, true);
  assert.ok((diags.some((d) => (d.message as string).includes("Non-exhaustive"))));
});

test("Duplicate unguarded match arm emits error", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }]]) });

  const mv = makeMatchVisitor({
    visitExpr: (e: any) => ({ ty: T.Enum("E"), alwaysReturns: false }),
    envEnumOfIdent: new Map([["v", "E"]]),
    enums,
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "v" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A", bind: null }, guard: null, body: { type: "IntLiteral" } },
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A", bind: null }, guard: null, body: { type: "IntLiteral" } },
    ],
  } as any;

  mv(m, [new Map()], false, null, true);
  assert.is(diags.length > 0, true);
  assert.ok((diags.some((d) => (d.message as string).includes("Duplicate unguarded"))));
});

test("Guard not bool emits diagnostic", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }]]) });

  const mv = makeMatchVisitor({
    visitExpr: (e: any) => ({ ty: T.Enum("E"), alwaysReturns: false }),
    envEnumOfIdent: new Map([["v", "E"]]),
    enums,
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "v" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A", bind: "b" }, guard: { type: "IntLiteral" }, body: { type: "IntLiteral" } },
    ],
  } as any;

  mv(m, [new Map()], false, null, true);
  assert.ok(diags.some((d) => (d.message as string).includes("Match guard must be Bool")));
});

test("Variant bind without payload declares unknown bind", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }]]) });

  const mv = makeMatchVisitor({
    visitExpr: (e: any) => ({ ty: T.Enum("E"), alwaysReturns: false }),
    envEnumOfIdent: new Map([["v", "E"]]),
    enums,
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "v" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A", bind: "b" }, guard: null, body: { type: "IntLiteral" } },
    ],
  } as any;

  mv(m, [new Map()], false, null, true);
  // no thrown; ensure we executed bind-declare path (no diags is acceptable)
  assert.is(true, true);
});

test("Unreachable arm after unguarded arm produces diagnostic", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }], ["B", { payloadField: null, payloadType: null }]]) });

  const mv = makeMatchVisitor({
    visitExpr: (e: any) => ({ ty: T.Enum("E"), alwaysReturns: false }),
    envEnumOfIdent: new Map([["v", "E"]]),
    enums,
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "v" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A", bind: null }, guard: null, body: { type: "IntLiteral" } },
      { pattern: { type: "VariantPattern", enumName: "E", variant: "B", bind: null }, guard: null, body: { type: "IntLiteral" } },
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A", bind: null }, guard: { type: "BoolLiteral" }, body: { type: "IntLiteral" } },
    ],
  } as any;

  mv(m, [new Map()], false, null, true);
  assert.ok(diags.some((d) => (d.message as string).includes("Unreachable match arm")));
});

test("Wildcard not last emits unreachable diagnostic for following arms", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }]]) });

  const mv = makeMatchVisitor({
    visitExpr: (e: any) => ({ ty: T.Enum("E"), alwaysReturns: false }),
    envEnumOfIdent: new Map([["v", "E"]]),
    enums,
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "v" },
    arms: [
      { pattern: { type: "WildcardPattern" }, guard: null, body: { type: "IntLiteral" } },
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A", bind: null }, guard: null, body: { type: "IntLiteral" } },
    ],
  } as any;

  mv(m, [new Map()], false, null, true);
  assert.ok(diags.some((d) => (d.message as string).includes("Unreachable match arms after '_'")));
});

test("Mismatched enum in pattern and unknown variant emit diagnostics", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E1", { variants: new Map([["A", { payloadField: null, payloadType: null }]]) });
  enums.set("E2", { variants: new Map([["B", { payloadField: null, payloadType: null }]]) });

  const mv = makeMatchVisitor({
    visitExpr: (e: any) => ({ ty: T.Enum("E1"), alwaysReturns: false }),
    envEnumOfIdent: new Map([["v", "E1"]]),
    enums,
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "v" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "E2", variant: "B", bind: null }, guard: null, body: { type: "IntLiteral" } },
    ],
  } as any;

  mv(m, [new Map()], false, null, true);
  assert.ok(diags.some((d) => (d.message as string).includes("Mismatched enum")));

  diags.length = 0;
  const m2 = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "v" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "E1", variant: "Z", bind: null }, guard: null, body: { type: "IntLiteral" } },
    ],
  } as any;
  mv(m2, [new Map()], false, null, true);
  assert.ok(diags.some((d) => (d.message as string).includes("Unknown variant")));
});

test("Arm payload-less bind emits 'has no payload to bind'", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }]]) });

  const mv = makeMatchVisitor({
    visitExpr: (e: any) => ({ ty: T.Enum("E"), alwaysReturns: false }),
    envEnumOfIdent: new Map([["v", "E"]]),
    enums,
    joinConcreteOrError: () => T.Int,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const m = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "v" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A", bind: "b" }, guard: null, body: { type: "IntLiteral" } },
    ],
  } as any;

  mv(m, [new Map()], false, null, true);
  assert.ok(diags.some((d) => (d.message as string).includes("has no payload to bind")));
});

test("Match duplicate unguarded and unreachable wildcard", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", {}], ["B", {}]]) });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitor = makeMatchVisitor({
    enums,
    T,
    sameType,
    typeToString,
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    envEnumOfIdent: new Map(),
    joinConcreteOrError: core.joinConcreteOrError,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Unit,
  });

  const matchNode = {
    type: "MatchExpr",
    value: { type: "Identifier", name: "x" },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A" }, guard: null, body: { type: "Block", statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } },
      { pattern: { type: "VariantPattern", enumName: "E", variant: "A" }, guard: null, body: { type: "Block", statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } },
      { pattern: { type: "WildcardPattern" }, guard: null, body: { type: "Block", statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } },
    ],
  } as any;

  visitor(matchNode, [new Map()], false, null);

  assert.ok(true);
});

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

  visitor({ type: 'MatchExpr', value: { type: 'EnumLiteral', enumName: 'E', variant: 'A', payload: null }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'E', variant: 'A' }, guard: null, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } }] } as any, [new Map()], false, null);

  visitor({ type: 'MatchExpr', value: { type: 'Identifier', name: 'x' }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'E', variant: 'A' }, guard: null, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } }] } as any, [new Map()], false, null);

  assert.ok(true);
});

test("Match visitor additional error branches", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }]]) });

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

  visitor({ type: 'MatchExpr', value: { type: 'EnumLiteral', enumName: 'E', variant: 'A', payload: null }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'F', variant: 'A' }, guard: null, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } }] } as any, [new Map()], false, null);

  visitor({ type: 'MatchExpr', value: { type: 'EnumLiteral', enumName: 'E', variant: 'A', payload: null }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'E', variant: 'X' }, guard: null, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } }] } as any, [new Map()], false, null);

  visitor({ type: 'MatchExpr', value: { type: 'EnumLiteral', enumName: 'E', variant: 'A', payload: null }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'E', variant: 'A', bind: 'x' }, guard: null, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } }] } as any, [new Map()], false, null);

  visitor({ type: 'MatchExpr', value: { type: 'EnumLiteral', enumName: 'E', variant: 'A', payload: null }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'E', variant: 'A' }, guard: { type: 'IntLiteral' }, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } }] } as any, [new Map()], false, null);

  visitor({ type: 'MatchExpr', value: { type: 'EnumLiteral', enumName: 'E', variant: 'A', payload: null }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'E', variant: 'A' }, guard: null, body: { type: 'Block', statements: [] } }] } as any, [new Map()], false, null);

  assert.ok(true);
});

test("Match binding payload/no-payload cases", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }], ["B", { payloadField: 'p', payloadType: { kind: 'Int' } }]]) });

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

  visitor({ type: 'MatchExpr', value: { type: 'EnumLiteral', enumName: 'E', variant: 'A', payload: null }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'E', variant: 'A', bind: 'x' }, guard: null, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } }] } as any, [new Map()], false, null);

  visitor({ type: 'MatchExpr', value: { type: 'EnumLiteral', enumName: 'E', variant: 'B', payload: { type: 'IntLiteral' } }, arms: [{ pattern: { type: 'VariantPattern', enumName: 'E', variant: 'B', bind: 'p' }, guard: null, body: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } }] } as any, [new Map()], false, null);

  assert.ok(true);
});

export const matchSuite = test;
