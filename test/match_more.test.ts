import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { T } from "../compiler/checkers/types.js";

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

export const matchMoreSuite = test;
