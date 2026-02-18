import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { T } from "../compiler/checkers/types.js";

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

export const matchMore3Suite = test;
