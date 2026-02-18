import type { Statement, Block } from "../ast.js";
import type { Scope, Ty, StmtResult, BlockResult } from "./types.js";
import type { Span } from "../span.js";

/**
 * Create statement and block visitors. Returns an object with
 * `visitStatement` and `visitBlock` functions that mirror the originals.
 */
/**
 * Create visitors for statements and blocks.
 *
 * Returns an object with `visitStatement` and `visitBlock` functions
 * that perform the same checks as the original in-file visitors.
 */
export function makeStmtVisitors(opts: {
  visitExpr: (e: any, stack: Scope[], inFn: boolean, expectedFnRet: Ty | null) => { ty: Ty; alwaysReturns: boolean };
  declare: (scope: Scope, name: string, ty: Ty, opts?: any) => void;
  resolveTypeNode: (n: any) => Ty;
  mustBe?: (a: Ty, b: Ty, message: string, at?: Span) => void;
  T: any;
  joinConcreteOrError: (tys: Ty[], ctx: string, at?: Span) => Ty;
  implicitReturnFromBody: (body: BlockResult, fnRetAnn: any, at?: Span) => BlockResult;
  finishScope: (s: Scope) => void;
  err: (message: string, span?: Span) => void;
  spanOf: (n: any) => Span | undefined;
  isEffectfulExpr: (e: any) => boolean;
  use: (stack: Scope[], name: string, at?: Span) => Ty;
  envEnumOfIdent: Map<string, string>;
  typeToString: (t: Ty) => string;
  requireValue?: (ty: Ty, what: string, at?: Span) => void;
}) {
  const { T } = opts;

  function visitStatement(
    st: Statement,
    stack: Scope[],
    isTopLevel: boolean,
    inFn: boolean,
    expectedFnRet: Ty | null,
    allowValueExprStmt: boolean,
  ): StmtResult {
    switch (st.type) {
      case "StructDecl":
      case "EnumDecl":
        return { alwaysReturns: false, returnTy: null, exprTy: null };

      case "ImportDecl": {
        for (const n of st.names) {
          opts.declare(stack[stack.length - 1], n, T.Any, {
            used: false,
            isTopLevel,
            isExported: false,
          });
        }
        return { alwaysReturns: false, returnTy: null, exprTy: null };
      }

      case "VarDecl": {
        const initRes = opts.visitExpr(st.initializer, stack, inFn, expectedFnRet);
        opts.requireValue && opts.requireValue(initRes.ty, "Initializer", opts.spanOf(st.initializer));

        const annTy = opts.resolveTypeNode(st.typeAnn);

        if (st.typeAnn) {
          opts.mustBe && opts.mustBe(
            initRes.ty,
            annTy,
            `Type mismatch in '${st.name}': expected ${opts.typeToString(annTy)}, got ${opts.typeToString(initRes.ty)}`,
            opts.spanOf(st),
          );
        }

        const effective = st.typeAnn ? annTy : initRes.ty;

        opts.declare(stack[stack.length - 1], st.name, effective, {
          used: !!st.isExported,
          isTopLevel,
          isExported: !!st.isExported,
        });

        if (st.initializer.type === "EnumLiteral") {
          opts.envEnumOfIdent.set(st.name, st.initializer.enumName);
        }

        return { alwaysReturns: false, returnTy: null, exprTy: null };
      }

      case "FunctionDecl": {
        const outer = stack[stack.length - 1];

        const paramTys = st.params.map((p) => opts.resolveTypeNode(p.typeAnn));
        const declaredRet = opts.resolveTypeNode(st.retType);
        const initialRet = st.retType ? declaredRet : T.Unknown;

        opts.declare(outer, st.name, T.Fn(paramTys, initialRet), {
          used: !!st.isExported,
          isTopLevel,
          isExported: !!st.isExported,
        });

        const fnScope: Scope = new Map();
        stack.push(fnScope);

        for (let i = 0; i < st.params.length; i++) {
          opts.declare(fnScope, st.params[i].name, paramTys[i], {
            used: false,
            isTopLevel: false,
            isExported: false,
          });
        }

        const bodyValueContext = st.retType == null;
        let bodyRes = visitBlock(
          st.body,
          stack,
          true,
          st.retType ? declaredRet : null,
          bodyValueContext,
        );

        bodyRes = opts.implicitReturnFromBody
          ? opts.implicitReturnFromBody(bodyRes, st.retType, opts.spanOf(st))
          : bodyRes;

        let effectiveRet: Ty = initialRet;

        if (st.retType) {
          if (
            declaredRet.kind !== "Unit" &&
            declaredRet.kind !== "Any" &&
            declaredRet.kind !== "Unknown" &&
            !bodyRes.alwaysReturns
          ) {
            opts.err(`Not all paths return a value in '${st.name}'`, opts.spanOf(st));
          }

          for (const rt of bodyRes.returnTys) {
            if (declaredRet.kind !== "Unit") {
              opts.requireValue && opts.requireValue(rt, "Return value", opts.spanOf(st));
            }
            opts.mustBe && opts.mustBe(
              rt,
              declaredRet,
              `Return type mismatch in '${st.name}': expected ${opts.typeToString(declaredRet)}, got ${opts.typeToString(rt)}`,
              opts.spanOf(st),
            );
          }

          effectiveRet = declaredRet;
        } else {
          effectiveRet = opts.joinConcreteOrError(
            bodyRes.returnTys.length ? bodyRes.returnTys : [T.Unit],
            `returns of '${st.name}'`,
            opts.spanOf(st),
          );
        }

        const entry = outer.get(st.name);
        if (entry && entry.ty.kind === "Fn") {
          entry.ty = T.Fn(entry.ty.params, effectiveRet);
        }

        opts.finishScope(fnScope);
        stack.pop();

        return { alwaysReturns: false, returnTy: null, exprTy: null };
      }

      case "PrintStmt": {
        for (const a of st.args) {
          const ar = opts.visitExpr(a, stack, inFn, expectedFnRet);
          opts.requireValue && opts.requireValue(ar.ty, "Print argument", opts.spanOf(a));
        }
        return { alwaysReturns: false, returnTy: null, exprTy: null };
      }

      case "ReturnStmt": {
        if (!inFn) {
          opts.err(`'return' is only allowed inside a function`, opts.spanOf(st));
          return { alwaysReturns: true, returnTy: null, exprTy: null };
        }

        if (st.value) {
          const vRes = opts.visitExpr(st.value, stack, inFn, expectedFnRet);
          opts.requireValue && opts.requireValue(vRes.ty, "Return value", opts.spanOf(st.value));

          if (
            expectedFnRet &&
            expectedFnRet.kind !== "Any" &&
            expectedFnRet.kind !== "Unknown"
          ) {
            opts.mustBe && opts.mustBe(
              vRes.ty,
              expectedFnRet,
              `Return type mismatch: expected ${opts.typeToString(expectedFnRet)}, got ${opts.typeToString(vRes.ty)}`,
              opts.spanOf(st),
            );
          }

          return { alwaysReturns: true, returnTy: vRes.ty, exprTy: null };
        } else {
          if (
            expectedFnRet &&
            expectedFnRet.kind !== "Any" &&
            expectedFnRet.kind !== "Unknown" &&
            expectedFnRet.kind !== "Unit"
          ) {
            opts.err(
              `Return value required: expected ${opts.typeToString(expectedFnRet)}`,
              opts.spanOf(st),
            );
          }
          return { alwaysReturns: true, returnTy: T.Unit, exprTy: null };
        }
      }

      case "ExpressionStmt": {
        if (!allowValueExprStmt && !opts.isEffectfulExpr(st.expression)) {
          opts.err(`Useless expression statement`, opts.spanOf(st));
          opts.visitExpr(st.expression, stack, inFn, expectedFnRet);
          return { alwaysReturns: false, returnTy: null, exprTy: null };
        }

        const res = opts.visitExpr(st.expression, stack, inFn, expectedFnRet);
        return {
          alwaysReturns: res.alwaysReturns,
          returnTy: null,
          exprTy: allowValueExprStmt ? res.ty : null,
        };
      }
    }
  }

  function visitBlock(
    b: Block,
    stack: Scope[],
    inFn: boolean,
    expectedFnRet: Ty | null,
    valueContext: boolean,
  ): BlockResult {
    const scope: Scope = new Map();
    stack.push(scope);

    let alwaysReturns = false;
    const returnTys: Ty[] = [];
    let lastTy: Ty = T.Unit;

    for (let i = 0; i < b.statements.length; i++) {
      const st = b.statements[i];

      if (alwaysReturns) {
        opts.err(`Unreachable statement`, opts.spanOf(st));
        continue;
      }

      const isLast = i === b.statements.length - 1;
      const allowValueExprStmt = valueContext && isLast;

      const res = visitStatement(
        st,
        stack,
        false,
        inFn,
        expectedFnRet,
        allowValueExprStmt,
      );

      if (res.returnTy) returnTys.push(res.returnTy);
      if (res.exprTy) lastTy = res.exprTy;

      alwaysReturns = alwaysReturns || res.alwaysReturns;
    }

    opts.finishScope(scope);
    stack.pop();

    return { ty: lastTy, alwaysReturns, returnTys };
  }

  return { visitStatement, visitBlock };
}
