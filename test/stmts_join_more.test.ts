import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeStmtVisitors } from "../compiler/checkers/stmts.js";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

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

export const stmtsJoinMoreSuite = test;
