import type { TypeNode } from "../ast.js";

/** Information about a struct's fields and their annotated types. */
export type StructInfo = { fields: Map<string, TypeNode | null> };

/** Information about an enum's variants and optional payload types. */
export type EnumInfo = {
  variants: Map<
    string,
    { payloadField: string | null; payloadType: TypeNode | null }
  >;
};

/** Runtime representation of types used by the checker. */
export type Ty =
  | { kind: "Int" }
  | { kind: "Bool" }
  | { kind: "String" }
  | { kind: "Unit" }
  | { kind: "Any" }
  | { kind: "Unknown" }
  | { kind: "Struct"; name: string }
  | { kind: "Enum"; name: string }
  | { kind: "Fn"; params: Ty[]; ret: Ty };

/** Convenient constants/constructors for `Ty`. */
export const T = {
  Int: { kind: "Int" } as Ty,
  Bool: { kind: "Bool" } as Ty,
  String: { kind: "String" } as Ty,
  Unit: { kind: "Unit" } as Ty,
  Any: { kind: "Any" } as Ty,
  Unknown: { kind: "Unknown" } as Ty,
  Struct: (name: string): Ty => ({ kind: "Struct", name }),
  Enum: (name: string): Ty => ({ kind: "Enum", name }),
  Fn: (params: Ty[], ret: Ty): Ty => ({ kind: "Fn", params, ret }),
};

/** Metadata for variables in a scope. */
export type ScopeEntry = {
  used: boolean;
  ty: Ty;
  isTopLevel: boolean;
  isExported: boolean;
};

/** Map of identifier -> metadata for a single lexical scope. */
export type Scope = Map<string, ScopeEntry>;

export type StmtResult = {
  alwaysReturns: boolean;
  returnTy: Ty | null;
  exprTy: Ty | null;
};

export type BlockResult = {
  ty: Ty;
  alwaysReturns: boolean;
  returnTys: Ty[];
};
