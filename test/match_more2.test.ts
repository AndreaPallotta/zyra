import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { T } from "../compiler/checkers/types.js";

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

export const matchMore2Suite = test;
