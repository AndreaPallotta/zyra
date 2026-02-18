import type { Expression, Block, MatchExpr } from "../ast.js";
import type { Scope, Ty } from "./types.js";
import type { Span } from "../span.js";

/**
 * Create an expression visitor bound to the provided checker helpers.
 * The returned function has the same shape as the original `visitExpr`.
 */
/**
 * Create an expression visitor bound to the provided checker helpers.
 *
 * The returned `visitExpr` function mirrors the original implementation
 * in `checker.ts` but is isolated for readability and testing.
 */
export function makeExprVisitor(opts: {
  use: (stack: Scope[], name: string, at?: Span) => Ty;
  T: any;
  sameType: (a: Ty, b: Ty) => boolean;
  typeToString: (t: Ty) => string;
  isBoolish: (t: Ty) => boolean;
  joinConcreteOrError: (tys: Ty[], ctx: string, at?: Span) => Ty;
  requireValue: (ty: Ty, what: string, at?: Span) => void;
  requireBranchValue: (ty: Ty, what: string, at?: Span) => void;
  resolveTypeNode: (n: any) => Ty;
  declare: (scope: Scope, name: string, ty: Ty, opts?: any) => void;
  envEnumOfIdent: Map<string, string>;
  structs: Map<string, any>;
  enums: Map<string, any>;
  visitBlock: (b: Block, stack: Scope[], inFn: boolean, expectedFnRet: Ty | null, valueContext: boolean) => { ty: Ty; alwaysReturns: boolean; };
  visitMatch: (m: MatchExpr, stack: Scope[], inFn: boolean, expectedFnRet: Ty | null, valueContext: boolean) => { ty: Ty };
  mustBe?: (a: Ty, b: Ty, message: string, at?: Span) => void;
  err: (message: string, span?: Span) => void;
  spanOf: (n: any) => Span | undefined;
}) {
  const { T, sameType, typeToString } = opts;

  return function visitExpr(
    e: Expression,
    stack: Scope[],
    inFn: boolean,
    expectedFnRet: Ty | null,
  ): { ty: Ty; alwaysReturns: boolean } {
    switch (e.type) {
      case "Identifier":
        return { ty: opts.use(stack, e.name, opts.spanOf(e)), alwaysReturns: false };

      case "IntLiteral":
        return { ty: T.Int, alwaysReturns: false };

      case "BoolLiteral":
        return { ty: T.Bool, alwaysReturns: false };

      case "StringLiteral":
        return { ty: T.String, alwaysReturns: false };

      case "InterpString": {
        for (const p of e.parts) {
          if (p.type === "Expr") {
            const pr = visitExpr(p.expr, stack, inFn, expectedFnRet);
            opts.requireValue(pr.ty, "Interpolation", opts.spanOf(p.expr));
          }
        }
        return { ty: T.String, alwaysReturns: false };
      }

      case "UnaryExpr": {
        const ot = visitExpr(e.operand, stack, inFn, expectedFnRet).ty;
        if (e.operator === "!") {
          if (!opts.isBoolish(ot)) opts.err(`Operator '!' expects Bool`, opts.spanOf(e));
          return { ty: T.Bool, alwaysReturns: false };
        }
        return { ty: T.Unknown, alwaysReturns: false };
      }

      case "BinaryExpr": {
        const lt = visitExpr(e.left, stack, inFn, expectedFnRet).ty;
        const rt = visitExpr(e.right, stack, inFn, expectedFnRet).ty;

        if (["+", "-", "*", "/"].includes(e.operator)) {
          if (lt.kind !== "Int" && lt.kind !== "Any" && lt.kind !== "Unknown")
            opts.err(`Operator '${e.operator}' expects Int`, opts.spanOf(e.left));
          if (rt.kind !== "Int" && rt.kind !== "Any" && rt.kind !== "Unknown")
            opts.err(`Operator '${e.operator}' expects Int`, opts.spanOf(e.right));
          return { ty: T.Int, alwaysReturns: false };
        }

        if (["<", "<=", ">", ">="].includes(e.operator)) {
          if (lt.kind !== "Int" && lt.kind !== "Any" && lt.kind !== "Unknown")
            opts.err(`Operator '${e.operator}' expects Int`, opts.spanOf(e.left));
          if (rt.kind !== "Int" && rt.kind !== "Any" && rt.kind !== "Unknown")
            opts.err(`Operator '${e.operator}' expects Int`, opts.spanOf(e.right));
          return { ty: T.Bool, alwaysReturns: false };
        }

        if (e.operator === "==" || e.operator === "!=") {
          if (
            lt.kind !== "Any" &&
            lt.kind !== "Unknown" &&
            rt.kind !== "Any" &&
            rt.kind !== "Unknown" &&
            !sameType(lt, rt)
          ) {
            opts.err(
              `Cannot compare ${typeToString(lt)} and ${typeToString(rt)} with '${e.operator}'`,
              opts.spanOf(e),
            );
          }
          return { ty: T.Bool, alwaysReturns: false };
        }

        if (e.operator === "&&" || e.operator === "||") {
          if (!opts.isBoolish(lt))
            opts.err(`Operator '${e.operator}' expects Bool`, opts.spanOf(e.left));
          if (!opts.isBoolish(rt))
            opts.err(`Operator '${e.operator}' expects Bool`, opts.spanOf(e.right));
          return { ty: T.Bool, alwaysReturns: false };
        }

        return { ty: T.Unknown, alwaysReturns: false };
      }

      case "CallExpr": {
        const calleeTy = visitExpr(e.callee, stack, inFn, expectedFnRet).ty;
        const argTys = e.args.map((a) => visitExpr(a, stack, inFn, expectedFnRet).ty);

        if (calleeTy.kind !== "Fn") {
          opts.err(
            `Cannot call non-function of type ${typeToString(calleeTy)}`,
            opts.spanOf(e),
          );
          return { ty: T.Unknown, alwaysReturns: false };
        }

        if (argTys.length !== calleeTy.params.length) {
          opts.err(
            `Wrong number of arguments: expected ${calleeTy.params.length}, got ${argTys.length}`,
            opts.spanOf(e),
          );
          return { ty: calleeTy.ret, alwaysReturns: false };
        }

        for (let i = 0; i < argTys.length; i++) {
          const expected = calleeTy.params[i];
          const got = argTys[i];

          if (
            expected.kind !== "Any" &&
            expected.kind !== "Unknown" &&
            got.kind !== "Any" &&
            got.kind !== "Unknown" &&
            !sameType(expected, got)
          ) {
            opts.err(
              `Argument ${i + 1} type mismatch: expected ${typeToString(expected)}, got ${typeToString(got)}`,
              opts.spanOf(e.args[i]),
            );
          }
        }

        return { ty: calleeTy.ret, alwaysReturns: false };
      }

      case "IfExpr": {
        if (e.init) {
          const initRes = visitExpr(e.init.initializer, stack, inFn, expectedFnRet);
          opts.requireValue(initRes.ty, "Initializer", opts.spanOf(e.init.initializer));

          const annTy = opts.resolveTypeNode(e.init.typeAnn);

          if (e.init.typeAnn) {
            opts.mustBe && opts.mustBe(
              initRes.ty,
              annTy,
              `Type mismatch in '${e.init.name}': expected ${typeToString(annTy)}, got ${typeToString(initRes.ty)}`,
              opts.spanOf(e.init),
            );
          }

          const effective = e.init.typeAnn ? annTy : initRes.ty;

          opts.declare(stack[stack.length - 1], e.init.name, effective, {
            used: false,
            isTopLevel: false,
            isExported: false,
          });

          if (e.init.initializer.type === "EnumLiteral") {
            opts.envEnumOfIdent.set(e.init.name, e.init.initializer.enumName);
          }
        }

        const ct = visitExpr(e.condition, stack, inFn, expectedFnRet).ty;
        if (!opts.isBoolish(ct)) opts.err(`If condition must be Bool`, opts.spanOf(e.condition));

        const thenRes = opts.visitBlock(e.thenBranch, stack, inFn, expectedFnRet, true);
        const thenTy = thenRes.ty;
        opts.requireBranchValue(thenTy, "If branch", opts.spanOf(e.thenBranch));

        let elseTy: Ty;
        let elseAlwaysReturns: boolean;

        if (e.elseBranch.type === "IfExpr") {
          const elseIfRes = visitExpr(e.elseBranch, stack, inFn, expectedFnRet);
          elseTy = elseIfRes.ty;
          elseAlwaysReturns = elseIfRes.alwaysReturns;
          opts.requireBranchValue(elseTy, "If branch", opts.spanOf(e.elseBranch));
        } else {
          const elseRes = opts.visitBlock(e.elseBranch, stack, inFn, expectedFnRet, true);
          elseTy = elseRes.ty;
          elseAlwaysReturns = elseRes.alwaysReturns;
          opts.requireBranchValue(elseTy, "If branch", opts.spanOf(e.elseBranch));
        }

        const joined = opts.joinConcreteOrError([thenTy, elseTy], "if branches", opts.spanOf(e));
        opts.requireValue(joined, "If expression", opts.spanOf(e));

        return { ty: joined, alwaysReturns: thenRes.alwaysReturns && elseAlwaysReturns };
      }

      case "StructLiteral": {
        const info = opts.structs.get(e.name);
        if (!info) {
          opts.err(`Unknown struct: ${e.name}`, opts.spanOf(e));
          for (const f of e.fields) visitExpr(f.value, stack, inFn, expectedFnRet);
          return { ty: T.Unknown, alwaysReturns: false };
        }

        const def = info.fields;
        const seen = new Set<string>();

        for (const f of e.fields) {
          if (!def.has(f.name)) opts.err(`Unknown field '${f.name}' in ${e.name}`, opts.spanOf(f));
          if (seen.has(f.name)) opts.err(`Duplicate field '${f.name}' in ${e.name}`, opts.spanOf(f));
          seen.add(f.name);

          const valTy = visitExpr(f.value, stack, inFn, expectedFnRet).ty;
          opts.requireValue(valTy, `Field '${e.name}.${f.name}'`, opts.spanOf(f.value));

          const fieldAnn = def.get(f.name) ?? null;
          const fieldTy = opts.resolveTypeNode(fieldAnn);

          if (fieldAnn) {
            opts.mustBe && opts.mustBe(
              valTy,
              fieldTy,
              `Type mismatch for field '${e.name}.${f.name}': expected ${typeToString(fieldTy)}, got ${typeToString(valTy)}`,
              opts.spanOf(f.value),
            );
          }
        }

        for (const req of def.keys()) {
          if (!seen.has(req)) opts.err(`Missing field '${req}' in ${e.name}`, opts.spanOf(e));
        }

        return { ty: T.Struct(e.name), alwaysReturns: false };
      }

      case "StructUpdateExpr": {
        const targetRes = visitExpr(e.target, stack, inFn, expectedFnRet);
        const targetTy = targetRes.ty;

        if (targetTy.kind !== "Struct") {
          opts.err(`Cannot update non-struct type ${typeToString(targetTy)}`, opts.spanOf(e));
          for (const f of e.fields) visitExpr(f.value, stack, inFn, expectedFnRet);
          return { ty: T.Unknown, alwaysReturns: false };
        }

        const info = opts.structs.get(targetTy.name);
        if (!info) {
          opts.err(`Unknown struct: ${targetTy.name}`, opts.spanOf(e));
          return { ty: T.Unknown, alwaysReturns: false };
        }

        const def = info.fields;
        const seen = new Set<string>();

        for (const f of e.fields) {
          if (!def.has(f.name)) opts.err(`Unknown field '${f.name}' in ${targetTy.name}`, opts.spanOf(f));
          if (seen.has(f.name)) opts.err(`Duplicate field '${f.name}' in ${targetTy.name}`, opts.spanOf(f));
          seen.add(f.name);

          const valTy = visitExpr(f.value, stack, inFn, expectedFnRet).ty;
          const fieldAnn = def.get(f.name) ?? null;
          const fieldTy = opts.resolveTypeNode(fieldAnn);

          if (fieldAnn) {
            opts.mustBe && opts.mustBe(
              valTy,
              fieldTy,
              `Type mismatch for field '${targetTy.name}.${f.name}': expected ${typeToString(fieldTy)}, got ${typeToString(valTy)}`,
              opts.spanOf(f.value),
            );
          }
        }

        return { ty: T.Struct(targetTy.name), alwaysReturns: false };
      }

      case "EnumLiteral": {
        const info = opts.enums.get(e.enumName);
        if (!info) {
          opts.err(`Unknown enum: ${e.enumName}`, opts.spanOf(e));
          if (e.payload) visitExpr(e.payload, stack, inFn, expectedFnRet);
          return { ty: T.Unknown, alwaysReturns: false };
        }

        const v = info.variants.get(e.variant);
        if (!v) {
          opts.err(`Unknown variant '${e.variant}' in ${e.enumName}`, opts.spanOf(e));
          if (e.payload) visitExpr(e.payload, stack, inFn, expectedFnRet);
          return { ty: T.Enum(e.enumName), alwaysReturns: false };
        }

        if (v.payloadField === null && e.payload !== null) opts.err(`${e.variant} takes no arguments`, opts.spanOf(e));
        if (v.payloadField !== null && e.payload === null) opts.err(`${e.variant} expects 1 argument`, opts.spanOf(e));

        if (e.payload) {
          const pt = visitExpr(e.payload, stack, inFn, expectedFnRet).ty;
          opts.requireValue(pt, "Enum payload", opts.spanOf(e.payload));

          const expected = opts.resolveTypeNode(v.payloadType);
          if (v.payloadType) {
            opts.mustBe && opts.mustBe(
              pt,
              expected,
              `Enum payload type mismatch for ${e.enumName}.${e.variant}: expected ${typeToString(expected)}, got ${typeToString(pt)}`,
              opts.spanOf(e.payload),
            );
          }
        }

        return { ty: T.Enum(e.enumName), alwaysReturns: false };
      }

      case "MatchExpr": {
        const res = opts.visitMatch(e, stack, inFn, expectedFnRet, true);
        opts.requireValue(res.ty, "Match expression", opts.spanOf(e));
        return { ty: res.ty, alwaysReturns: false };
      }

      case "Block": {
        const res = opts.visitBlock(e, stack, inFn, expectedFnRet, true);
        return { ty: res.ty, alwaysReturns: res.alwaysReturns };
      }
    }
  };
}
