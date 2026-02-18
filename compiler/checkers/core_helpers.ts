import type { Ty, BlockResult } from "./types.js";
import type { TypeNode } from "../ast.js";
import type { Span } from "../span.js";

/**
 * Factory for core checker helper functions that depend on checker state.
 * Binds `T`, `sameType`, `typeToString`, `resolveTypeNode` and `err`.
 */
/**
 * Create core helper utilities used across the checker visitors.
 *
 * These helpers are pure functions that still depend on a few pieces
 * of checker state (notably `T` and the `resolveTypeNode` function), so
 * they are produced by this factory to keep `checker.ts` concise.
 */
export function makeCoreHelpers(opts: {
  T: any;
  sameType: (a: Ty, b: Ty) => boolean;
  typeToString: (t: Ty) => string;
  resolveTypeNode: (n: TypeNode | null) => Ty;
  err: (message: string, span?: Span) => void;
}) {
  const { T, sameType, typeToString, resolveTypeNode, err } = opts;

  /** Ensure `t` matches `expected` or emit an error. */
  function mustBe(t: Ty, expected: Ty, message: string, at?: Span) {
    if (expected.kind === "Any" || expected.kind === "Unknown") return;
    if (t.kind === "Any" || t.kind === "Unknown") return;
    if (!sameType(t, expected)) err(message, at);
  }

  /**
   * Join a set of types into a single concrete type when possible.
   * Emits errors for incompatible combinations and returns `Unknown`.
   */
  function joinConcreteOrError(tys: Ty[], ctx: string, at?: Span): Ty {
    const concrete = tys.filter((t) => t.kind !== "Unknown" && t.kind !== "Any");
    if (concrete.length === 0) {
      if (tys.some((t) => t.kind === "Any")) return T.Any;
      return T.Unknown;
    }

    const hasUnit = concrete.some((t) => t.kind === "Unit");
    const hasNonUnit = concrete.some((t) => t.kind !== "Unit");
    if (hasUnit && hasNonUnit) {
      const nonUnit = concrete.find((t) => t.kind !== "Unit")!;
      err(`Incompatible types in ${ctx}: Unit and ${typeToString(nonUnit)}`, at);
      return T.Unknown;
    }

    const first = concrete[0];
    for (let i = 1; i < concrete.length; i++) {
      if (!sameType(first, concrete[i])) {
        err(
          `Incompatible types in ${ctx}: ${typeToString(first)} and ${typeToString(concrete[i])}`,
          at,
        );
        return T.Unknown;
      }
    }
    return first;
  }

  /** Emit an error if a value-producing context receives `Unit`. */
  function requireValue(ty: Ty, what: string, at?: Span) {
    if (ty.kind === "Unit") err(`${what} must produce a value`, at);
  }

  /** Emit an error if a branch-producing context receives `Unit`. */
  function requireBranchValue(ty: Ty, what: string, at?: Span) {
    if (ty.kind === "Unit") err(`${what} must produce a value`, at);
  }

  /**
   * When a function has no explicit return annotation, include the
   * implicit final expression as a potential return value.
   */
  function implicitReturnFromBody(
    body: BlockResult,
    fnRetAnn: TypeNode | null,
    at?: Span,
  ): BlockResult {
    if (fnRetAnn) {
      const annTy = resolveTypeNode(fnRetAnn);
      if (annTy.kind === "Unit") {
        return body;
      }
      return body;
    }

    if (!body.alwaysReturns) {
      if (body.ty.kind !== "Unit") {
        return {
          ty: body.ty,
          alwaysReturns: false,
          returnTys: [...body.returnTys, body.ty],
        };
      }

      return {
        ty: body.ty,
        alwaysReturns: false,
        returnTys: [...body.returnTys, T.Unit],
      };
    }

    return body;
  }

  return { mustBe, joinConcreteOrError, requireValue, requireBranchValue, implicitReturnFromBody };
}
