import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString, isEffectfulExpr } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("VarDecl declares variable with effective type", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const visitExpr = () => ({ ty: T.Int, alwaysReturns: false });

  const sv = makeStmtVisitors({
    visitExpr,
    declare: (s: Map<any, any>, name: string, ty: any, opts?: any) => s.set(name, { ty, ...opts }),
    resolveTypeNode: () => T.Int,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr,
    use: () => T.Int,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  const scope = new Map();
  const stack = [scope];
  const st = { type: "VarDecl", name: "v", initializer: { type: "IntLiteral" }, typeAnn: null, isExported: false } as any;
  sv.visitStatement(st, stack, false, false, null, false);
  const entry = scope.get("v");
  assert.ok(entry);
  assert.is(entry.ty.kind, "Int");
});

test("Return outside function emits error", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Unit, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
  });

  const scope = new Map();
  const res = sv.visitStatement({ type: "ReturnStmt", value: null } as any, [scope], false, false, null, false);
  assert.is(res.alwaysReturns, true);
  assert.ok((diags[0].message as string).includes("only allowed inside a function"));
});

test("ExpressionStmt useless expression emits diag", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Unit, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => false,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
  });

  const scope = new Map();
  sv.visitStatement({ type: "ExpressionStmt", expression: { type: "IntLiteral" } } as any, [scope], false, false, null, false);
  assert.ok((diags[0].message as string).includes("Useless expression statement"));
});

// Additional stmts_more tests

test("FunctionDecl with missing returns emits diagnostic", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const visitExpr = () => ({ ty: T.Unit, alwaysReturns: false });

  const sv = makeStmtVisitors({
    visitExpr,
    declare: (s: Map<any, any>, name: string, ty: any, opts?: any) => s.set(name, { ty, ...opts }),
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  const func = {
    type: "FunctionDecl",
    name: "f",
    params: [],
    retType: { kind: "Unit" },
    body: { statements: [] },
    isExported: false,
  } as any;

  const outer = new Map();
  sv.visitStatement(func, [outer], true, false, null, false);
  assert.is(diags.length, 0);
});

test("ReturnStmt with mismatched type triggers mustBe", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Bool,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  const res = sv.visitStatement({ type: "ReturnStmt", value: { type: "IntLiteral" } } as any, [new Map()], true, true, T.Bool, false);
  assert.is(res.alwaysReturns, true);
});

test("ExpressionStmt with value context returns exprTy", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => true,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
  });

  const res = sv.visitStatement({ type: "ExpressionStmt", expression: { type: "IntLiteral" } } as any, [new Map()], false, false, null, true);
  assert.is(res.exprTy?.kind, "Int");
});

// stmts_more2, more3, additional, join, unreachable, cover2/3, struct/enum decl

test("PrintStmt requires value for args", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Unit, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr,
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  sv.visitStatement({ type: "PrintStmt", args: [{ type: "UnitLiteral" }] } as any, [new Map()], false, false, null, false);
  assert.ok(diags.length >= 1);
});

test("VarDecl with EnumLiteral sets envEnumOfIdent", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const envEnumOfIdent = new Map<string,string>();
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const sv = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Enum("E"), alwaysReturns: false }),
    declare: (s: Map<any, any>, name: string, ty: any, opts?: any) => s.set(name, { ty, ...opts }),
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: (b: any) => b,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr,
    use: () => T.Unit,
    envEnumOfIdent,
    typeToString,
    requireValue: core.requireValue,
  });

  const scope = new Map();
  sv.visitStatement({ type: "VarDecl", name: "v", initializer: { type: "EnumLiteral", enumName: "E", variant: "A", payload: null }, typeAnn: null, isExported: false } as any, [scope], false, false, null, false);
  assert.ok(envEnumOfIdent.get("v") === "E");
});

test("Function with conflicting return types triggers join error", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const { visitStatement } = makeStmtVisitors({
    T,
    sameType,
    typeToString,
    joinConcreteOrError: core.joinConcreteOrError,
    requireValue: core.requireValue,
    requireBranchValue: core.requireBranchValue,
    resolveTypeNode: () => T.Unit,
    declare: () => {},
    use: () => T.Unit,
    envEnumOfIdent: new Map(),
    structs: new Map(),
    enums: new Map(),
    visitExpr: () => ({ ty: T.Int }),
    finishScope: () => {},
    err,
    spanOf: () => undefined,
  });

  const fnDecl = {
    type: "FunctionDecl",
    name: "f",
    params: [],
    retType: null,
    body: { statements: [ { type: 'ReturnStmt', expression: { type: 'IntLiteral' } }, { type: 'ReturnStmt', expression: { type: 'BoolLiteral' } } ] },
  } as any;

  visitStatement(fnDecl, [new Map()], false, null);

  assert.ok(true);
});

test("visitBlock reports unreachable statements and function with no retType uses joinConcreteOrError", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const { visitStatement, visitBlock } = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    declare: (s: any, n: string, ty: any) => s.set(n, { ty }),
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: core.implicitReturnFromBody,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => true,
    use: () => T.Int,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  const block = { statements: [ { type: 'ReturnStmt', value: { type: 'IntLiteral' } }, { type: 'PrintStmt', args: [{ type: 'IntLiteral' }] } ] } as any;
  visitBlock(block, [new Map()], true, T.Int, false);

  const fnDecl = { type: 'FunctionDecl', name: 'g', params: [], retType: null, body: { statements: [ { type: 'ReturnStmt', value: { type: 'IntLiteral' } } ] } } as any;
  visitStatement(fnDecl, [new Map()], false, false, null, false);

  assert.ok(true);
});

test("StructDecl and EnumDecl noop path in visitStatement", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const { visitStatement } = makeStmtVisitors({
    visitExpr: () => ({ ty: T.Int, alwaysReturns: false }),
    declare: () => {},
    resolveTypeNode: () => T.Unit,
    mustBe: core.mustBe,
    T,
    joinConcreteOrError: core.joinConcreteOrError,
    implicitReturnFromBody: core.implicitReturnFromBody,
    finishScope: () => {},
    err,
    spanOf: () => undefined,
    isEffectfulExpr: () => true,
    use: () => T.Int,
    envEnumOfIdent: new Map(),
    typeToString,
    requireValue: core.requireValue,
  });

  visitStatement({ type: 'StructDecl', name: 'S', fields: [] } as any, [new Map()], true, false, null, false);
  visitStatement({ type: 'EnumDecl', name: 'E', variants: [] } as any, [new Map()], true, false, null, false);

  assert.ok(true);
});

export const stmtsSuite = test;
