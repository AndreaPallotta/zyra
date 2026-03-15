import type { Span } from "./span.js";

type WithSpan = { span: Span };





export type Program = {
  type: "Program";
  body: Statement[];
} & WithSpan;





export type Statement =
  | ImportDecl
  | VarDecl
  | FunctionDecl
  | StructDecl
  | EnumDecl
  | PrintStmt
  | ReturnStmt
  | ExpressionStmt;

export type VarDecl = {
  type: "VarDecl";
  kind: "const" | "var";
  name: string;
  typeAnn: TypeNode | null;
  initializer: Expression;
  isExported?: boolean;
} & WithSpan;

export type FunctionParam = {
  name: string;
  typeAnn: TypeNode | null;
} & WithSpan;

export type FunctionDecl = {
  type: "FunctionDecl";
  name: string;
  params: FunctionParam[];
  retType: TypeNode | null;
  body: Block;
  isExported?: boolean;
} & WithSpan;

export type StructField = {
  name: string;
  typeAnn: TypeNode | null;
} & WithSpan;

export type StructDecl = {
  type: "StructDecl";
  name: string;
  fields: StructField[];
} & WithSpan;

export type EnumVariant = {
  name: string;
  payloadField: string | null;
  payloadType: TypeNode | null;
} & WithSpan;

export type EnumDecl = {
  type: "EnumDecl";
  name: string;
  variants: EnumVariant[];
} & WithSpan;

export type ExpressionStmt = {
  type: "ExpressionStmt";
  expression: Expression;
} & WithSpan;

export type PrintStmt = {
  type: "PrintStmt";
  kind: "print" | "print_raw";
  args: Expression[];
} & WithSpan;

export type ReturnStmt = {
  type: "ReturnStmt";
  value: Expression | null;
} & WithSpan;

export type ImportDecl = {
  type: "ImportDecl";
  from: string;
  names: string[];
} & WithSpan;





export type TypeNode =
  | ({ type: "AnyType" } & WithSpan)
  | ({ type: "NamedType"; name: string } & WithSpan);





export type Block = {
  type: "Block";
  statements: Statement[];
} & WithSpan;





export type Expression =
  | Identifier
  | IntLiteral
  | StringLiteral
  | BoolLiteral
  | InterpString
  | BinaryExpr
  | UnaryExpr
  | CallExpr
  | IfExpr
  | MatchExpr
  | StructLiteral
  | StructUpdateExpr
  | EnumLiteral
  | Block;

export type Identifier = {
  type: "Identifier";
  name: string;
} & WithSpan;

export type IntLiteral = {
  type: "IntLiteral";
  value: number;
} & WithSpan;

export type StringLiteral = {
  type: "StringLiteral";
  value: string;
} & WithSpan;

export type BoolLiteral = {
  type: "BoolLiteral";
  value: boolean;
} & WithSpan;

export type InterpString = {
  type: "InterpString";
  parts: (
    | ({ type: "Text"; value: string } & WithSpan)
    | ({ type: "Expr"; expr: Expression } & WithSpan)
  )[];
  raw: boolean;
} & WithSpan;

export type BinaryExpr = {
  type: "BinaryExpr";
  operator: string;
  left: Expression;
  right: Expression;
} & WithSpan;

export type UnaryExpr = {
  type: "UnaryExpr";
  operator: string;
  operand: Expression;
} & WithSpan;

export type CallExpr = {
  type: "CallExpr";
  callee: Expression;
  args: Expression[];
} & WithSpan;

export type IfExpr = {
  type: "IfExpr";
  init: VarDecl | null;
  condition: Expression;
  thenBranch: Block;
  elseBranch: Block | IfExpr;
} & WithSpan;

export type MatchExpr = {
  type: "MatchExpr";
  value: Expression;
  arms: MatchArm[];
} & WithSpan;

export type MatchArm = {
  pattern: Pattern;
  guard: Expression | null;
  body: Expression;
} & WithSpan;

export type Pattern =
  | ({ type: "WildcardPattern" } & WithSpan)
  | ({ type: "LiteralPattern"; value: Expression } & WithSpan)
  | ({
      type: "VariantPattern";
      enumName: string;
      variant: string;
      payloadField: string | null;
      bind: string | null;
    } & WithSpan);

export type StructLiteral = {
  type: "StructLiteral";
  name: string;
  fields: { name: string; value: Expression; span: Span }[];
} & WithSpan;

export type StructUpdateExpr = {
  type: "StructUpdateExpr";
  target: Expression;
  fields: { name: string; value: Expression; span: Span }[];
} & WithSpan;

export type EnumLiteral = {
  type: "EnumLiteral";
  enumName: string;
  variant: string;
  payloadField: string | null;
  payload: Expression | null;
} & WithSpan;
