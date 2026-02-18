import type { Ty } from "./types.js";

/**
 * Check structural type equality used by the checker.
 *
 * This treats `Any` and `Unknown` as matching anything to avoid
 * noisy errors during incremental inference.
 */
export function sameType(a: Ty, b: Ty): boolean {
  if (a.kind === "Any" || b.kind === "Any") return true;
  if (a.kind === "Unknown" || b.kind === "Unknown") return true;
  if (a.kind !== b.kind) return false;

  if (a.kind === "Struct" || a.kind === "Enum")
    return a.name === (b as any).name;

  if (a.kind === "Fn") {
    const fb = b as any as Ty & { kind: "Fn" };
    if (a.params.length !== fb.params.length) return false;
    if (!sameType(a.ret, fb.ret)) return false;
    for (let i = 0; i < a.params.length; i++) {
      if (!sameType(a.params[i], fb.params[i])) return false;
    }
    return true;
  }
  return true;
}

/**
 * Format a `Ty` into a human readable string for diagnostics.
 *
 * Examples: `Int`, `Struct(Point)`, `fn(Int)->Unit`.
 */
export function typeToString(t: Ty): string {
  switch (t.kind) {
    case "Struct":
    case "Enum":
      return `${t.kind}(${t.name})`;
    case "Fn":
      return `fn(${t.params.map(typeToString).join(", ")})->${typeToString(t.ret)}`;
    default:
      return t.kind;
  }
}

/**
 * Return true for types that can be used in boolean contexts
 * (includes `Any` and `Unknown` to avoid cascading errors).
 */
export function isBoolish(t: Ty): boolean {
  return t.kind === "Bool" || t.kind === "Any" || t.kind === "Unknown";
}

/**
 * Quick check whether an expression node is effectful (may produce
 * control flow or side effects). Used to validate expression statements.
 */
export function isEffectfulExpr(e: { type: string }): boolean {
  return (
    e.type === "CallExpr" ||
    e.type === "IfExpr" ||
    e.type === "MatchExpr" ||
    e.type === "Block"
  );
}
