import type { Span } from "../span.js";
import type { Scope, Ty } from "./types.js";

/**
 * Create environment helpers that manage scope entries and diagnostics.
 *
 * The returned helpers are thin wrappers around the local `diags`
 * array used by the checker; binding them out keeps `checker.ts`
 * easier to read and allows unit testing of state logic.
 */
export function makeEnvHelpers(opts: {
  diags: Array<any>;
  T: any;
}) {
  const { diags } = opts;

  /** Push an error diagnostic. */
  function err(message: string, span?: Span) {
    diags.push({ level: "error", message, span });
  }

  /** Push a warning diagnostic. */
  function warn(message: string, span?: Span) {
    diags.push({ level: "warn", message, span });
  }

  /**
   * Extract a `span` field from AST nodes where available.
   * Returns `undefined` when the node doesn't carry a span.
   */
  function spanOf(n: any): Span | undefined {
    return n && typeof n === "object" && "span" in n ? (n.span as Span) : undefined;
  }

  /**
   * Declare a name in the provided scope with metadata.
   * This mirrors the original inline `declare` helper.
   */
  function declare(
    scope: Scope,
    name: string,
    ty: Ty,
    opts?: { used?: boolean; isTopLevel?: boolean; isExported?: boolean },
  ) {
    scope.set(name, {
      used: opts?.used ?? false,
      ty,
      isTopLevel: opts?.isTopLevel ?? false,
      isExported: opts?.isExported ?? false,
    });
  }

  /** Lookup a name in a stack of scopes, mark it used and return its type.
   * Emits an error when the identifier is unknown.
   */
  function use(scopeStack: Scope[], name: string, at?: Span): Ty {
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      const entry = scopeStack[i].get(name);
      if (entry) {
        entry.used = true;
        return entry.ty;
      }
    }
    err(`Unknown identifier: ${name}`, at);
    return opts.T.Unknown;
  }

  /** Report unused local variables in a finished scope. */
  function finishScope(scope: Scope) {
    for (const [name, meta] of scope.entries()) {
      if (!meta.used && !name.startsWith("_") && !meta.isTopLevel) {
        err(`Unused variable: ${name}`);
      }
    }
  }

  /** Emit warnings for unused top-level declarations. */
  function warnUnusedTopLevel(scope: Scope) {
    for (const [name, meta] of scope.entries()) {
      if (!meta.used && !name.startsWith("_") && meta.isTopLevel) {
        warn(`Unused top-level declaration: ${name}`);
      }
    }
  }

  return { err, warn, spanOf, declare, use, finishScope, warnUnusedTopLevel };
}
