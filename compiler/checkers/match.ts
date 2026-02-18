import type { MatchExpr, MatchArm, Expression } from "../ast.js";
import type { Scope, Ty } from "./types.js";
import type { Span } from "../span.js";
import type { EnumInfo } from "./types.js";

/**
 * Factory that produces a `visitMatch` function bound to the provided
 * checker utilities and state. This keeps the match-checking logic
 * isolated while allowing it to call back into the main visitor.
 */
/**
 * Create a `visitMatch` function bound to the provided checker state
 * and helper callbacks. This isolates match-checking logic from the
 * main flow so it is easier to read and test.
 */
export function makeMatchVisitor(opts: {
  visitExpr: (e: Expression, stack: Scope[], inFn: boolean, expectedFnRet: Ty | null) => { ty: Ty; alwaysReturns: boolean };
  envEnumOfIdent: Map<string, string>;
  enums: Map<string, EnumInfo>;
  joinConcreteOrError: (tys: Ty[], ctx: string, at?: Span) => Ty;
  err: (message: string, span?: Span) => void;
  spanOf: (n: any) => Span | undefined;
  finishScope: (s: Scope) => void;
  declare: (scope: Scope, name: string, ty: Ty, opts?: { used?: boolean; isTopLevel?: boolean; isExported?: boolean }) => void;
  resolveTypeNode: (n: any) => Ty;
}) {
  return function visitMatch(
    m: MatchExpr,
    stack: Scope[],
    inFn: boolean,
    expectedFnRet: Ty | null,
    valueContext: boolean,
  ): { ty: Ty } {
    opts.visitExpr(m.value, stack, inFn, expectedFnRet);

    function resolveEnumNameFromValue(value: Expression): string | null {
      if (value.type === "EnumLiteral") return value.enumName;
      if (value.type === "Identifier")
        return opts.envEnumOfIdent.get(value.name) ?? null;
      const t = opts.visitExpr(value, stack, false, null).ty;
      if (t.kind === "Enum") return t.name;
      return null;
    }

    function inferEnumNameFromArms(arms: MatchArm[]): string | null {
      let inferred: string | null = null;
      for (const arm of arms) {
        if (arm.pattern.type !== "VariantPattern") continue;
        if (!inferred) inferred = arm.pattern.enumName;
        else if (inferred !== arm.pattern.enumName) return null;
      }
      return inferred;
    }

    let enumName = resolveEnumNameFromValue(m.value);
    if (!enumName) enumName = inferEnumNameFromArms(m.arms);

    const armBodyTys: Ty[] = [];

    if (enumName) {
      const info = opts.enums.get(enumName);

      const seenUnguarded = new Set<string>();
      for (const arm of m.arms) {
        if (arm.pattern.type !== "VariantPattern") continue;
        if (arm.guard != null) continue;
        if (arm.pattern.enumName !== enumName) continue;
        const v = arm.pattern.variant;
        if (seenUnguarded.has(v))
          opts.err(`Duplicate unguarded match arm for '${v}'`, opts.spanOf(arm));
        seenUnguarded.add(v);
      }

      const hasUnguardedSeen = new Set<string>();
      for (const arm of m.arms) {
        if (arm.pattern.type !== "VariantPattern") continue;
        if (arm.pattern.enumName !== enumName) continue;
        const v = arm.pattern.variant;
        if (hasUnguardedSeen.has(v)) {
          opts.err(`Unreachable match arm for '${v}' after unguarded arm`, opts.spanOf(arm));
          continue;
        }
        if (arm.guard == null) hasUnguardedSeen.add(v);
      }

      for (let i = 0; i < m.arms.length; i++) {
        const arm = m.arms[i];
        if (arm.pattern.type === "WildcardPattern" && arm.guard == null) {
          if (i !== m.arms.length - 1)
            opts.err(`Unreachable match arms after '_'`, opts.spanOf(arm));
          break;
        }
      }

      if (info) {
        const hasUnguardedWildcard = m.arms.some(
          (a) => a.pattern.type === "WildcardPattern" && a.guard == null,
        );

        if (!hasUnguardedWildcard) {
          const seen = new Set<string>();
          for (const arm of m.arms) {
            if (
              arm.pattern.type === "VariantPattern" &&
              arm.pattern.enumName === enumName &&
              arm.guard == null
            ) {
              seen.add(arm.pattern.variant);
            }
          }
          for (const v of info.variants.keys()) {
            if (!seen.has(v))
              opts.err(`Non-exhaustive match on ${enumName}: missing '${v}'`, opts.spanOf(m));
          }
        }
      }
    }

    for (const arm of m.arms) {
      const armScope: Scope = new Map();
      stack.push(armScope);

      if (arm.pattern.type === "VariantPattern") {
        if (enumName && arm.pattern.enumName !== enumName) {
          opts.err(`Mismatched enum in match pattern: expected ${enumName}, got ${arm.pattern.enumName}`, opts.spanOf(arm.pattern));
        }

        const einfo = enumName
          ? opts.enums.get(enumName)
          : opts.enums.get(arm.pattern.enumName);
        const effectiveEnum = enumName ?? arm.pattern.enumName;
        const vinfo = einfo?.variants.get(arm.pattern.variant) ?? null;

        if (!vinfo) {
          opts.err(`Unknown variant '${arm.pattern.variant}' in ${effectiveEnum}`, opts.spanOf(arm.pattern));
        } else {
          if (vinfo.payloadField === null && arm.pattern.bind) {
            opts.err(`${arm.pattern.variant} has no payload to bind`, opts.spanOf(arm.pattern));
          }
          if (vinfo.payloadField !== null && arm.pattern.bind) {
            const bindTy = opts.resolveTypeNode(vinfo.payloadType);
            opts.declare(armScope, arm.pattern.bind, bindTy, {
              used: false,
              isTopLevel: false,
              isExported: false,
            });
          }
        }

        if (arm.pattern.bind && !armScope.has(arm.pattern.bind)) {
          opts.declare(armScope, arm.pattern.bind, { kind: "Unknown" } as Ty, {
            used: false,
            isTopLevel: false,
            isExported: false,
          });
        }
      }

      if (arm.guard) {
        const gt = opts.visitExpr(arm.guard, stack, inFn, expectedFnRet).ty;
        if (!gt || (gt.kind !== "Bool" && gt.kind !== "Any" && gt.kind !== "Unknown"))
          opts.err(`Match guard must be Bool`, opts.spanOf(arm.guard));
      }

      const bodyTy = opts.visitExpr(arm.body, stack, inFn, expectedFnRet).ty;

      if (valueContext) {
        if (bodyTy.kind === "Unit") opts.err(`Match arm must produce a value`, opts.spanOf(arm.body));
      }

      armBodyTys.push(bodyTy);

      opts.finishScope(armScope);
      stack.pop();
    }

    const matchTy = opts.joinConcreteOrError(armBodyTys, "match arms", opts.spanOf(m));
    return { ty: matchTy };
  };
}
