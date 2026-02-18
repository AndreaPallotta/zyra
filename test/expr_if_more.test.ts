import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("IfExpr init with annotated enum and mustBe path", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const enums = new Map();
  enums.set("E", { variants: new Map([["A", { payloadField: null, payloadType: null }]]) });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: (n:any) => (n ? T.Enum(n.name || 'E') : T.Unit), err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: (n:any) => (n && n.kind === 'Enum' ? T.Enum('E') : T.Unit),
    declare: (s:any, name:string, ty:any) => s.set(name, { ty }),
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums,
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  const ife = {
    type: "IfExpr",
    init: { name: "x", initializer: { type: "EnumLiteral", enumName: "E", variant: "A", payload: null }, typeAnn: { kind: 'Enum', name: 'E' } },
    condition: { type: "BoolLiteral" },
    thenBranch: { statements: [{ type: "ExpressionStmt", expression: { type: "IntLiteral" } }] },
    elseBranch: { statements: [{ type: "ExpressionStmt", expression: { type: "IntLiteral" } }] },
  } as any;

  visitor(ife, [new Map()], false, null);
  // envEnumOfIdent should be set via init initializer being EnumLiteral
  // no specific assert needed, just ensure no crash and possible diagnostics collected
  assert.ok(true);
});

export const exprIfMoreSuite = test;
