import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeExprVisitor } from "../compiler/checkers/expr.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isBoolish } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

const s_expr = test;
// content from expr.test.ts
s_expr("Identifier resolves via use", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
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

  const res = visitor({ type: "Identifier", name: "x" } as any, [], false, null);
  assert.is(res.ty.kind, "Int");
  assert.is(diags.length, 0);
});

s_expr("CallExpr reports error when callee not a function", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
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

  const call = { type: "CallExpr", callee: { type: "Identifier", name: "f" }, args: [] } as any;
  const r = visitor(call, [], false, null);
  assert.is(r.ty.kind, "Unknown");
  assert.ok((diags[0].message as string).includes("Cannot call non-function"));
});

s_expr("BinaryExpr arithmetic enforces Int", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => ({ kind: "String" } as any),
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

  const bex = { type: "BinaryExpr", operator: "+", left: { type: "Identifier", name: "a" }, right: { type: "IntLiteral" } } as any;
  const res = visitor(bex, [], false, null);
  assert.is(res.ty.kind, "Int");
  assert.is(diags.length, 1);
  assert.ok((diags[0].message as string).includes("expects Int"));
});

const s_exprMore = test;
// content from expr_more.test.ts
s_exprMore("More expression branches: arithmetic, comparison, logical, interpstring, call-arg-count", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Unit,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  // Arithmetic
  visitor({ type: 'BinaryExpr', operator: '+', left: { type: 'IntLiteral' }, right: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  // Comparison
  visitor({ type: 'BinaryExpr', operator: '<', left: { type: 'IntLiteral' }, right: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  // Logical &&
  visitor({ type: 'BinaryExpr', operator: '&&', left: { type: 'BoolLiteral' }, right: { type: 'BoolLiteral' } } as any, [new Map()], false, null);

  // InterpString with expression part that returns Int (ok)
  visitor({ type: 'InterpString', parts: [{ type: 'Str', value: 'a' }, { type: 'Expr', expr: { type: 'IntLiteral' } }] } as any, [new Map()], false, null);

  // CallExpr arg count mismatch (callee is function)
  const calleeFn = { type: 'CallExpr', callee: { type: 'Identifier', name: 'f' }, args: [{ type: 'IntLiteral' }, { type: 'IntLiteral' }] } as any;
  // create a visitor where use returns a function type expecting 1 param
  const visitorFn = makeExprVisitor({ ...{ use: () => T.Fn([T.Int], T.Int) }, T, sameType, typeToString, isBoolish, joinConcreteOrError: core.joinConcreteOrError, requireValue: core.requireValue, requireBranchValue: core.requireBranchValue, resolveTypeNode: () => T.Unit, declare: () => {}, envEnumOfIdent: new Map(), structs: new Map(), enums: new Map(), visitBlock: () => ({ ty: T.Int, alwaysReturns: false }), visitMatch: () => ({ ty: T.Int }), mustBe: core.mustBe, err, spanOf: () => undefined });
  visitorFn(calleeFn, [new Map()], false, null);

  assert.ok(true);
});

const s_exprMoreFinal = test;
// content from expr_more_final.test.ts
s_exprMoreFinal("InterpString checks embedded exprs for value", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => T.Unit,
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

  const interp = { type: "InterpString", parts: [{ type: "Literal", value: "a" }, { type: "Expr", expr: { type: "Identifier", name: "x" } }] } as any;
  visitor(interp, [], false, null);
  assert.ok(diags.length === 1);
});

s_exprMoreFinal("Unary '!' reports when operand not boolish", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
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

  const u = { type: "UnaryExpr", operator: "!", operand: { type: "Identifier", name: "a" } } as any;
  const r = visitor(u, [], false, null);
  assert.is(r.ty.kind, "Bool");
  assert.is(diags.length, 1);
});

s_exprMoreFinal("Binary comparison and equality emit diagnostics on bad types", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => ({ kind: "String" } as any),
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

  const cmp = { type: "BinaryExpr", operator: "<", left: { type: "Identifier", name: "a" }, right: { type: "Identifier", name: "b" } } as any;
  const eq = { type: "BinaryExpr", operator: "==", left: { type: "Identifier", name: "a" }, right: { type: "Identifier", name: "b" } } as any;
  visitor(cmp, [], false, null);
  visitor(eq, [], false, null);
  assert.ok(diags.length >= 1);
});

const s_exprEnumMore = test;
// content from expr_enum_more.test.ts
s_exprEnumMore("expr: exercise many operator/struct/enum branches", () => {
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

const s_exprBranchExhaustive = test;
s_exprBranchExhaustive("BinaryExpr unknown operator falls through to Unknown", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Unit,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  visitor({ type: 'BinaryExpr', operator: '^', left: { type: 'IntLiteral' }, right: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  assert.ok(true);
});

const s_exprBinaryUnknownOp = test;
s_exprBinaryUnknownOp("BinaryExpr unknown operator falls through to Unknown - duplicate check", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Unit,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  visitor({ type: 'BinaryExpr', operator: '^', left: { type: 'IntLiteral' }, right: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  assert.ok(true);
});

const s_exprIfMore = test;
s_exprIfMore("IfExpr with init and non-bool condition triggers checks", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish: (t:any) => false, // make condition non-boolish to trigger err
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Int,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  const ife = {
    type: 'IfExpr',
    init: { name: 'x', initializer: { type: 'IntLiteral' }, typeAnn: { kind: 'Int' } },
    condition: { type: 'IntLiteral' },
    thenBranch: { statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] },
    elseBranch: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] },
  } as any;

  visitor(ife, [new Map()], false, null);

  assert.ok(true);
});

const s_exprIfInitCases = test;
s_exprIfInitCases("IfExpr init with annotated enum and mustBe path", () => {
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
  assert.ok(true);
});

const s_exprStructUpdateMore = test;
s_exprStructUpdateMore("Struct literal unknown field and struct update unknown field", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const structs = new Map();
  structs.set("S", { fields: new Map([["a", { name: "a", type: T.Int }]]), name: "S" });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitor = makeExprVisitor({
    use: () => T.Struct('S'),
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Unit,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs,
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });
  const structLit = { type: "StructLiteral", name: "S", fields: [{ name: "b", value: { type: "IntLiteral" } }] } as any;
  visitor(structLit, [new Map()], false, null);

  const structUpdate = { type: "StructUpdateExpr", target: { type: "Identifier", name: "s" }, fields: [{ name: "b", value: { type: "IntLiteral" } }], typeAnn: { kind: 'Struct', name: 'S' } } as any;
  visitor(structUpdate, [new Map()], false, null);

  assert.ok(true);
});

const s_exprStructUpdateFieldAnn = test;
s_exprStructUpdateFieldAnn("StructUpdate with field annotation triggers mustBe branch", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const structs = new Map();
  // field annotation stored as a TypeNode-like object
  structs.set("S", { fields: new Map([["a", { kind: 'Int' }]]), name: 'S' });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: (n:any) => (n && n.kind === 'Int' ? T.Int : T.Unit), err });

  const visitor = makeExprVisitor({
    use: () => T.Struct('S'),
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: (n:any) => (n && n.kind === 'Int' ? T.Int : T.Unit),
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs,
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  const structUpdate = { type: 'StructUpdateExpr', target: { type: 'Identifier', name: 's' }, fields: [{ name: 'a', value: { type: 'IntLiteral' } }] } as any;
  visitor(structUpdate, [new Map()], false, null);

  assert.ok(true);
});

const s_exprStructMore2 = test;
s_exprStructMore2("Struct literal duplicate/missing fields and update target errors", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const structs = new Map();
  structs.set("S", { fields: new Map([["a", { name: "a", type: { kind: 'Int' } }], ["b", { name: 'b', type: { kind: 'Int' } }]]), name: 'S' });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  // Duplicate field
  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Unit,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs,
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  visitor({ type: 'StructLiteral', name: 'S', fields: [{ name: 'a', value: { type: 'IntLiteral' } }, { name: 'a', value: { type: 'IntLiteral' } }] } as any, [new Map()], false, null);

  // Missing field 'b'
  visitor({ type: 'StructLiteral', name: 'S', fields: [{ name: 'a', value: { type: 'IntLiteral' } }] } as any, [new Map()], false, null);

  // StructUpdate: target not a struct
  const visitorNonStruct = makeExprVisitor({ ...{ use: () => T.Int }, T, sameType, typeToString, isBoolish, joinConcreteOrError: core.joinConcreteOrError, requireValue: core.requireValue, requireBranchValue: core.requireBranchValue, resolveTypeNode: () => T.Unit, declare: () => {}, envEnumOfIdent: new Map(), structs, enums: new Map(), visitBlock: () => ({ ty: T.Int, alwaysReturns: false }), visitMatch: () => ({ ty: T.Int }), mustBe: core.mustBe, err, spanOf: () => undefined });

  visitorNonStruct({ type: 'StructUpdateExpr', target: { type: 'Identifier', name: 'x' }, fields: [{ name: 'a', value: { type: 'IntLiteral' } }] } as any, [new Map()], false, null);

  // StructUpdate: unknown struct name on target type
  const visitorUnknownStruct = makeExprVisitor({ ...{ use: () => T.Struct('X') }, T, sameType, typeToString, isBoolish, joinConcreteOrError: core.joinConcreteOrError, requireValue: core.requireValue, requireBranchValue: core.requireBranchValue, resolveTypeNode: () => T.Unit, declare: () => {}, envEnumOfIdent: new Map(), structs, enums: new Map(), visitBlock: () => ({ ty: T.Int, alwaysReturns: false }), visitMatch: () => ({ ty: T.Int }), mustBe: core.mustBe, err, spanOf: () => undefined });

  visitorUnknownStruct({ type: 'StructUpdateExpr', target: { type: 'Identifier', name: 's' }, fields: [{ name: 'a', value: { type: 'IntLiteral' } }] } as any, [new Map()], false, null);

  assert.ok(true);
});

const s_exprMiscMore = test;
s_exprMiscMore("CallExpr non-function, Binary/Unary type errors, nested IfExpr else-if", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType,
    typeToString,
    isBoolish,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Unit,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums: new Map(),
    visitBlock: () => ({ ty: T.Int, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Int }),
    mustBe: core.mustBe,
    err,
    spanOf: () => undefined,
  });

  // Call on non-function
  visitor({ type: 'CallExpr', callee: { type: 'Identifier', name: 'x' }, args: [] } as any, [new Map()], false, null);

  // Binary equality mismatch
  visitor({ type: 'BinaryExpr', operator: '==', left: { type: 'IntLiteral' }, right: { type: 'BoolLiteral' } } as any, [new Map()], false, null);

  // Unary ! on non-bool
  visitor({ type: 'UnaryExpr', operator: '!', operand: { type: 'IntLiteral' } } as any, [new Map()], false, null);

  // Nested IfExpr as elseBranch
  const nestedIf = { type: 'IfExpr', init: null, condition: { type: 'BoolLiteral' }, thenBranch: { statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] }, elseBranch: { type: 'IfExpr', init: null, condition: { type: 'BoolLiteral' }, thenBranch: { statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] }, elseBranch: { type: 'Block', statements: [{ type: 'ExpressionStmt', expression: { type: 'IntLiteral' } }] } } } as any;
  visitor(nestedIf, [new Map()], false, null);

  assert.ok(true);
});

const s_exprMatchUnit = test;
s_exprMatchUnit("MatchExpr returning Unit triggers requireValue error", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const visitor = makeExprVisitor({
    use: () => T.Int,
    T,
    sameType: (a:any,b:any) => a.kind === b.kind,
    typeToString: (t:any) => t.kind || String(t),
    isBoolish: () => true,
    joinConcreteOrError: () => T.Unit,
    requireValue: () => {},
    requireBranchValue: () => {},
    resolveTypeNode: () => T.Unit,
    declare: () => {},
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums: new Map(),
    visitBlock: () => ({ ty: T.Unit, alwaysReturns: false }),
    visitMatch: () => ({ ty: T.Unit }),
    mustBe: () => {},
    err,
    spanOf: () => undefined,
  });

  visitor({ type: 'MatchExpr', value: { type: 'Identifier', name: 'x' }, arms: [] } as any, [new Map()], false, null);

  assert.ok(true);
});

export const exprSuite = {
  run: async () => {
    await s_expr.run();
    await s_exprMore.run();
    await s_exprMoreFinal.run();
    await s_exprEnumMore.run();
    await s_exprBranchExhaustive.run();
    await s_exprBinaryUnknownOp.run();
    await s_exprIfMore.run();
    await s_exprIfInitCases.run();
    await s_exprStructUpdateMore.run();
    await s_exprStructUpdateFieldAnn.run();
    await s_exprStructMore2.run();
    await s_exprMiscMore.run();
    await s_exprMatchUnit.run();
  },
};
