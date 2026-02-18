import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeMatchVisitor } from "../compiler/checkers/match.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("stmts: StructDecl and EnumDecl cases return without error", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const stmtVis = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Unit, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Int,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: core.implicitReturnFromBody,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => false,
    use: () => T.Unknown,
    envEnumOfIdent: new Map(),
    typeToString,
  });

  const sdecl = { type: "StructDecl", name: "S", fields: [] } as any;
  const edecl = { type: "EnumDecl", name: "E", variants: [] } as any;

  const res1 = stmtVis.visitStatement(sdecl, [new Map()], true, false, null, false);
  const res2 = stmtVis.visitStatement(edecl, [new Map()], true, false, null, false);
  assert.ok(res1 && res2);
});

test("match: einfo present but variant unknown and payload/bind mismatch", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const variants = new Map();
  variants.set("HasNoPayload", { payloadField: null, payloadType: null });
  const enums = new Map();
  enums.set("MyEnum", { variants });

  const mv = makeMatchVisitor({
    visitExpr: () => ({ ty: T.Unit, alwaysReturns: false }),
    envEnumOfIdent: new Map(),
    enums,
    joinConcreteOrError: (_tys: any) => T.Unit,
    err,
    spanOf: () => undefined,
    finishScope: () => {},
    declare: () => {},
    resolveTypeNode: () => T.Int,
  });

  const matchExpr = {
    type: "MatchExpr",
    value: { type: "EnumLiteral", enumName: "MyEnum", variant: "Missing", payloadField: null, payload: null },
    arms: [
      { pattern: { type: "VariantPattern", enumName: "MyEnum", variant: "Missing", payloadField: null, bind: null }, guard: null, body: { type: "IntLiteral", value: 1 } },
      { pattern: { type: "VariantPattern", enumName: "MyEnum", variant: "HasNoPayload", payloadField: null, bind: "b" }, guard: null, body: { type: "IntLiteral", value: 2 } },
    ],
  } as any;

  const res = mv(matchExpr, [new Map()], false, null, true);
  assert.ok(res.ty);
  // Expect diagnostics: unknown variant for 'Missing' and bind error for 'HasNoPayload'
  assert.ok(diags.some((d) => /Unknown variant/.test(d.message)));
  assert.ok(diags.some((d) => /has no payload to bind/i.test(d.message)));
});

export const coverStructEnumAndMatchMore = test;
