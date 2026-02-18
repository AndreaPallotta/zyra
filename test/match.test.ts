import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { T } from "../compiler/checkers/types.js";

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

export const matchSuite = test;
