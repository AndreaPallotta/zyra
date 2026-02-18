import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("expr: exercise many operator/struct/enum branches", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const resolveTypeNode = (n: any) => {
    if (!n) return T.Unknown;
    if (n.type === "AnyType") return T.Any;
    if (n.name === "Int") return T.Int;
    if (n.name === "Bool") return T.Bool;
    if (n.name === "String") return T.String;
    return T.Unknown;
  };

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode, err });

  const structs = new Map();
  const pointFields = new Map();
  pointFields.set("x", null);
  pointFields.set("y", null);
  structs.set("Point", { fields: pointFields });

  const variants = new Map();
  variants.set("A", { payloadField: null, payloadType: null });
  variants.set("B", { payloadField: "v", payloadType: { type: "NamedType", name: "Int" } });
  const enums = new Map();
  enums.set("E", { variants });

  const use = (_stack: any[], name: string) => {
    switch (name) {
      case "i":
        return T.Int;
      case "s":
        return T.String;
      case "b":
        return T.Bool;
      case "p":
        return T.Struct("Point");
      case "e":
        return T.Enum("E");
      case "f_wrong":
        return T.Fn([T.String], T.Unit);
      case "f_good":
        return T.Fn([T.Int, T.Int], T.Int);
      default:
        return T.Unknown;
    }
  };

  const visitor = makeExprVisitor({
    use,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs,
    enums,
    visitBlock: () => ({ ty: T.Unit, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Unit }),
    err,
    spanOf: () => undefined,
  });

  // Unary '!' on Bool and on Int (error)
  visitor({ type: "UnaryExpr", operator: "!", operand: { type: "BoolLiteral", value: true } } as any, [], false, null);
  visitor({ type: "UnaryExpr", operator: "!", operand: { type: "Identifier", name: "i" } } as any, [], false, null);

  // Binary arithmetic and comparison - good and bad
  visitor({ type: "BinaryExpr", operator: "+", left: { type: "Identifier", name: "i" }, right: { type: "Identifier", name: "i" } } as any, [], false, null);
  visitor({ type: "BinaryExpr", operator: "+", left: { type: "Identifier", name: "s" }, right: { type: "Identifier", name: "i" } } as any, [], false, null);
  visitor({ type: "BinaryExpr", operator: "<", left: { type: "Identifier", name: "i" }, right: { type: "Identifier", name: "s" } } as any, [], false, null);
  visitor({ type: "BinaryExpr", operator: "==", left: { type: "Identifier", name: "i" }, right: { type: "Identifier", name: "s" } } as any, [], false, null);
  visitor({ type: "BinaryExpr", operator: "&&", left: { type: "Identifier", name: "b" }, right: { type: "Identifier", name: "i" } } as any, [], false, null);

  // CallExpr: callee not a function, arg count mismatch, arg type mismatch
  visitor({ type: "CallExpr", callee: { type: "Identifier", name: "s" }, args: [] } as any, [], false, null);
  visitor({ type: "CallExpr", callee: { type: "Identifier", name: "f_good" }, args: [{ type: "IntLiteral", value: 1 }] } as any, [], false, null);
  visitor({ type: "CallExpr", callee: { type: "Identifier", name: "f_wrong" }, args: [{ type: "IntLiteral", value: 1 }] } as any, [], false, null);

  // IfExpr with init and else-if
  const ifNode = {
    type: "IfExpr",
    init: { name: "x", typeAnn: { type: "NamedType", name: "Int" }, initializer: { type: "IntLiteral", value: 1 }, span: undefined },
    condition: { type: "BoolLiteral", value: true },
    thenBranch: { type: "Block", statements: [{ type: "ExpressionStmt", expression: { type: "IntLiteral", value: 1 } }] },
    elseBranch: { type: "IfExpr", init: null, condition: { type: "BoolLiteral", value: true }, thenBranch: { type: "Block", statements: [{ type: "ExpressionStmt", expression: { type: "IntLiteral", value: 2 } }] }, elseBranch: { type: "Block", statements: [{ type: "ExpressionStmt", expression: { type: "IntLiteral", value: 3 } }] } },
  } as any;
  visitor(ifNode, [], false, null);

  // StructLiteral unknown / duplicate / missing
  visitor({ type: "StructLiteral", name: "Nope", fields: [{ name: "a", value: { type: "IntLiteral", value: 1 } }] } as any, [], false, null);
  visitor({ type: "StructLiteral", name: "Point", fields: [{ name: "x", value: { type: "IntLiteral", value: 1 } }, { name: "x", value: { type: "IntLiteral", value: 2 } }] } as any, [], false, null);
  visitor({ type: "StructLiteral", name: "Point", fields: [] } as any, [], false, null);

  // StructUpdate: target non-struct and unknown struct
  visitor({ type: "StructUpdateExpr", target: { type: "Identifier", name: "i" }, fields: [{ name: "x", value: { type: "IntLiteral", value: 1 } }] } as any, [], false, null);
  visitor({ type: "StructUpdateExpr", target: { type: "Identifier", name: "p" }, fields: [{ name: "z", value: { type: "IntLiteral", value: 1 } }] } as any, [], false, null);

  // EnumLiteral unknown / unknown variant / payload mismatch / payload type mismatch
  visitor({ type: "EnumLiteral", enumName: "NoE", variant: "X", payloadField: null, payload: null } as any, [], false, null);
  visitor({ type: "EnumLiteral", enumName: "E", variant: "NoV", payloadField: null, payload: null } as any, [], false, null);
  visitor({ type: "EnumLiteral", enumName: "E", variant: "A", payloadField: null, payload: { type: "IntLiteral", value: 1 } } as any, [], false, null);
  visitor({ type: "EnumLiteral", enumName: "E", variant: "B", payloadField: "v", payload: null } as any, [], false, null);
  visitor({ type: "EnumLiteral", enumName: "E", variant: "B", payloadField: "v", payload: { type: "StringLiteral", value: "hi" } } as any, [], false, null);

  // Ensure we produced diagnostics for at least some errors
  assert.ok(diags.length > 0);
});

export const exprBranchExhaustive = test;
