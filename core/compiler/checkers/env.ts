import type { Span } from "../span.js";
import type { Scope, Ty, TConst, ScopeEntry } from "./types.js";

/**
 * Create environment helpers that manage scope entries and diagnostics.
 *
 * The returned helpers are thin wrappers around the local `diags`
 * array used by the checker; binding them out keeps `checker.ts`
 * easier to read and allows unit testing of state logic.
 */
export function makeEnvHelpers(opts: {
  diags: Array<{ level: string; message: string; span?: Span }>;
  T: TConst;
  options?: {
    onUseIdentifier?: (name: string, entry: ScopeEntry, useSpan: Span) => void;
    onDeclareIdentifier?: (name: string, entry: ScopeEntry, declSpan: Span) => void;
  };
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
  function spanOf(n: { span?: Span } | null | undefined): Span | undefined {
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
    declOpts?: { used?: boolean; isTopLevel?: boolean; isExported?: boolean; span?: Span },
  ) {
    const entry: ScopeEntry = {
      used: declOpts?.used ?? false,
      ty,
      isTopLevel: declOpts?.isTopLevel ?? false,
      isExported: declOpts?.isExported ?? false,
      span: declOpts?.span,
    };
    scope.set(name, entry);
    if (declOpts?.span && opts.options?.onDeclareIdentifier) {
      opts.options.onDeclareIdentifier(name, entry, declOpts.span);
    }
  }

  /** Lookup a name in a stack of scopes, mark it used and return its type.
   * Emits an error when the identifier is unknown.
   */
  function use(scopeStack: Scope[], name: string, at?: Span): Ty {
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      const entry = scopeStack[i].get(name);
      if (entry) {
        entry.used = true;
        if (at && opts.options?.onUseIdentifier) {
          opts.options.onUseIdentifier(name, entry, at);
        }
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
