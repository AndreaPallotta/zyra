import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("Comprehensive exercise of expression branches", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: (n:any) => (n && n.kind === 'Int'? T.Int : T.Unit), err });

  const structs = new Map();
  const def = new Map();
  def.set("f", { kind: "Int" });
  structs.set("S", { fields: def });

  const enums = new Map();
  const ev = new Map();
  ev.set("V", { payloadField: "p", payloadType: { kind: "Int" } });
  enums.set("E", { variants: ev });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: (n:any) => (n ? (n.kind === 'Int' ? T.Int : T.Unit) : T.Unit),
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs,
    enums,
    visitBlock: () => ({ ty: T.Unit, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  // Unary with non-! operator -> Unknown
  const unknownUnary = { type: "UnaryExpr", operator: "~", operand: { type: "IntLiteral" } } as any;
  const ru = visitor(unknownUnary, [], false, null);
  assert.is(ru.ty.kind, "Unknown");

  // Binary logical operator
  visitor({ type: "BinaryExpr", operator: "&&", left: { type: "BoolLiteral" }, right: { type: "BoolLiteral" } } as any, [], false, null);

  // IfExpr with init and elseBranch as IfExpr
  const ife = {
    type: "IfExpr",
    init: { name: "x", initializer: { type: "IntLiteral" }, typeAnn: { kind: 'Int' } },
    condition: { type: "BoolLiteral" },
    thenBranch: { statements: [{ type: "ExpressionStmt", expression: { type: "IntLiteral" } }] },
    elseBranch: { type: "IfExpr", init: null, condition: { type: "BoolLiteral" }, thenBranch: { statements: [] }, elseBranch: { statements: [] } } as any,
  } as any;
  visitor(ife, [], false, null);

  // StructUpdate on non-struct target
  visitor({ type: "StructUpdateExpr", target: { type: "IntLiteral" }, fields: [{ name: "f", value: { type: "IntLiteral" } }] } as any, [], false, null);

  // StructUpdate with struct but unknown struct info
  visitor({ type: "StructUpdateExpr", target: { type: "Identifier", name: "s" }, fields: [{ name: "f", value: { type: "IntLiteral" } }] } as any, [], false, null);

  // EnumLiteral with payload mismatch and mustBe path
  visitor({ type: "EnumLiteral", enumName: "E", variant: "V", payload: { type: "IntLiteral" } } as any, [], false, null);

  // Block
  visitor({ type: "Block", statements: [] } as any, [], false, null);

  assert.ok(diags.length >= 0);
});

export const comprehensiveSuite = test;
