import {
  Program,
  Statement,
  VarDecl,
  FunctionDecl,
  Block,
  Expression,
  IfExpr,
  Pattern,
  StructDecl,
  StructLiteral,
  StructUpdateExpr,
  EnumDecl,
  ImportDecl,
  PrintStmt,
  TypeNode,
  FunctionParam,
  ReturnStmt,
} from "./ast.js";
import { Token, lex } from "./lexer.js";
import { type Span, mergeSpan } from "./span.js";

type TokenType = Token["type"];
type TokenOf<T extends TokenType> = Extract<Token, { type: T }>;

export class Parser {
  private pos = 0;
  private structs = new Map<string, string[]>();
  private enums = new Map<string, Map<string, string | null>>();

  constructor(private tokens: Token[]) {}

  parseProgram(): Program {
    const start = this.startTok();
    const body: Statement[] = [];

    while (!this.check("eof")) {
      body.push(this.parseStatement());
      this.match("semicolon");
    }

    const end = this.endTok();
    return { type: "Program", body, span: this.spanFrom(start, end) };
  }

  private parseStatement(): Statement {
    const start = this.startTok();
    const isExported = this.match("export");

    if (this.match("const"))
      return this.parseVarDecl("const", isExported, start);
    if (this.match("var")) return this.parseVarDecl("var", isExported, start);
    if (this.match("def")) return this.parseFunction(isExported, start);

    if (isExported) throw new Error("export must be followed by const/var/def");

    if (this.match("return")) return this.parseReturnStmt(start);

    if (this.match("struct")) return this.parseStructDecl(start);
    if (this.match("enum")) return this.parseEnumDecl(start);
    if (this.match("from")) return this.parseImportDecl(start);

    if (this.match("print")) return this.parsePrintStmt("print", start);
    if (this.match("print_raw")) return this.parsePrintStmt("print_raw", start);

    const expr = this.parseExpression();
    const end = this.endTok();
    return {
      type: "ExpressionStmt",
      expression: expr,
      span: this.spanFrom(start, end),
    };
  }

  private parseReturnStmt(start: Token): ReturnStmt {
    if (this.check("rbrace")) {
      const end = this.endTok();
      return {
        type: "ReturnStmt",
        value: null,
        span: this.spanFrom(start, end),
      };
    }
    const value = this.parseExpression();
    const end = this.endTok();
    return { type: "ReturnStmt", value, span: this.spanFrom(start, end) };
  }

  private parseImportDecl(start: Token): ImportDecl {
    const fromTok = this.expect("path");
    this.expect("import");

    const names: string[] = [];
    names.push(this.expect("identifier").value);
    while (this.match("comma")) names.push(this.expect("identifier").value);

    const end = this.endTok();
    return {
      type: "ImportDecl",
      from: fromTok.value,
      names,
      span: this.spanFrom(start, end),
    };
  }

  private parsePrintStmt(kind: "print" | "print_raw", start: Token): PrintStmt {
    this.expect("lparen");

    const args: Expression[] = [];
    if (!this.check("rparen")) {
      do {
        args.push(this.parseExpression());
      } while (this.match("comma"));
    }

    this.expect("rparen");
    const end = this.endTok();
    return { type: "PrintStmt", kind, args, span: this.spanFrom(start, end) };
  }

  private parseEnumDecl(start: Token): EnumDecl {
    const nameTok = this.expect("identifier");
    this.expect("lbrace");

    const variants: {
      name: string;
      payloadField: string | null;
      payloadType: TypeNode | null;
      span: Span;
    }[] = [];
    const table = new Map<string, string | null>();

    while (!this.check("rbrace")) {
      const vStart = this.startTok();
      const vname = this.expect("identifier").value;

      let payloadField: string | null = null;
      let payloadType: TypeNode | null = null;

      if (this.match("lparen")) {
        payloadField = this.expect("identifier").value;
        this.expect("colon");
        payloadType = this.parseTypeNode();
        this.expect("rparen");
      }

      if (table.has(vname))
        throw new Error(
          `Duplicate enum variant '${vname}' in ${nameTok.value}`,
        );

      table.set(vname, payloadField);
      const vEnd = this.endTok();
      variants.push({
        name: vname,
        payloadField,
        payloadType,
        span: this.spanFrom(vStart, vEnd),
      });

      this.match("comma");
    }

    this.expect("rbrace");
    this.enums.set(nameTok.value, table);

    const end = this.endTok();
    return {
      type: "EnumDecl",
      name: nameTok.value,
      variants,
      span: this.spanFrom(start, end),
    };
  }

  private parseStructDecl(start: Token): StructDecl {
    const nameTok = this.expect("identifier");
    this.expect("lbrace");

    const fields: { name: string; typeAnn: TypeNode | null; span: Span }[] = [];
    const seen = new Set<string>();

    while (!this.check("rbrace")) {
      const fStart = this.startTok();
      const fname = this.expect("identifier").value;
      this.expect("colon");
      const fty = this.parseTypeNode();

      if (seen.has(fname))
        throw new Error(`Duplicate field '${fname}' in ${nameTok.value}`);
      seen.add(fname);

      const fEnd = this.endTok();
      fields.push({
        name: fname,
        typeAnn: fty,
        span: this.spanFrom(fStart, fEnd),
      });
      this.match("comma");
    }

    this.expect("rbrace");

    this.structs.set(
      nameTok.value,
      fields.map((f) => f.name),
    );

    const end = this.endTok();
    return {
      type: "StructDecl",
      name: nameTok.value,
      fields,
      span: this.spanFrom(start, end),
    };
  }

  private parseVarDecl(
    kind: "const" | "var",
    isExported: boolean,
    start: Token,
  ): VarDecl {
    const nameTok = this.expect("identifier");
    const typeAnn = this.parseOptionalTypeAnn();
    this.expect("equals");
    const initializer = this.parseExpression();
    const end = this.endTok();

    return {
      type: "VarDecl",
      kind,
      name: nameTok.value,
      typeAnn,
      initializer,
      isExported,
      span: this.spanFrom(start, end),
    };
  }

  private parseVarDeclAfterKind(kind: "const" | "var"): VarDecl {
    const start = this.startTok();
    const nameTok = this.expect("identifier");
    const typeAnn = this.parseOptionalTypeAnn();
    this.expect("equals");
    const initializer = this.parseExpression();
    const end = this.endTok();

    return {
      type: "VarDecl",
      kind,
      name: nameTok.value,
      typeAnn,
      initializer,
      isExported: false,
      span: this.spanFrom(start, end),
    };
  }

  private parseFunction(isExported: boolean, start: Token): FunctionDecl {
    const nameTok = this.expect("identifier");
    this.expect("lparen");

    const params: FunctionParam[] = [];
    if (!this.check("rparen")) {
      do {
        const pStart = this.startTok();
        const pname = this.expect("identifier").value;
        const typeAnn = this.parseOptionalTypeAnn();
        const pEnd = this.endTok();
        params.push({
          name: pname,
          typeAnn,
          span: this.spanFrom(pStart, pEnd),
        });
      } while (this.match("comma"));
    }

    this.expect("rparen");

    const retType = this.parseOptionalReturnType();
    const body = this.parseBlock();

    const end = this.endTok();
    return {
      type: "FunctionDecl",
      name: nameTok.value,
      params,
      retType,
      body,
      isExported,
      span: this.spanFrom(start, end),
    };
  }

  private parseBlock(): Block {
    const start = this.startTok();
    this.expect("lbrace");

    const statements: Statement[] = [];
    while (!this.check("rbrace")) {
      statements.push(this.parseStatement());
      this.match("semicolon");
    }

    this.expect("rbrace");
    const end = this.endTok();
    return { type: "Block", statements, span: this.spanFrom(start, end) };
  }

  private parseIfExpr(start: Token): IfExpr {
    this.expect("lparen");

    let init: VarDecl | null = null;

    if (this.match("const")) init = this.parseVarDeclAfterKind("const");
    else if (this.match("var")) init = this.parseVarDeclAfterKind("var");

    if (init) this.expect("semicolon");

    const condition = this.parseExpression();
    this.expect("rparen");

    const thenBranch = this.parseBlock();
    this.expect("else");

    let elseBranch: Block | IfExpr;
    if (this.match("if")) {
      const ifTok = this.previous("if");
      elseBranch = this.parseIfExpr(ifTok);
    } else {
      elseBranch = this.parseBlock();
    }

    const end = this.endTok();
    return {
      type: "IfExpr",
      init,
      condition,
      thenBranch,
      elseBranch,
      span: this.spanFrom(start, end),
    };
  }

  private parseMatch(start: Token): Expression {
    this.expect("lparen");
    const value = this.parseExpression();
    this.expect("rparen");

    this.expect("lbrace");

    const arms: any[] = [];
    while (!this.check("rbrace")) {
      const aStart = this.startTok();
      const pattern = this.parsePattern();

      let guard: Expression | null = null;
      if (this.match("if")) {
        guard = this.parseExpression();
      }

      this.expect("arrow");
      const body = this.parseExpression();
      const aEnd = this.endTok();

      arms.push({ pattern, guard, body, span: this.spanFrom(aStart, aEnd) });

      if (this.match("comma")) continue;
    }

    this.expect("rbrace");
    const end = this.endTok();

    return { type: "MatchExpr", value, arms, span: this.spanFrom(start, end) };
  }

  private parsePattern(): Pattern {
    const start = this.startTok();

    if (this.match("identifier")) {
      const t = this.previous("identifier");
      const name = t.value;

      if (name === "_") {
        const end = this.endTok();
        return { type: "WildcardPattern", span: this.spanFrom(start, end) };
      }

      if (this.check("lparen")) {
        this.expect("lparen");
        const bind = this.expect("identifier").value;
        this.expect("rparen");
        const end = this.endTok();

        const info = this.resolveVariant(name);

        return {
          type: "VariantPattern",
          enumName: info ? info.enumName : "",
          variant: name,
          payloadField: info ? info.payloadField : null,
          bind,
          span: this.spanFrom(start, end),
        };
      }

      const info = this.resolveVariant(name);
      if (info) {
        const end = this.endTok();
        return {
          type: "VariantPattern",
          enumName: info.enumName,
          variant: name,
          payloadField: info.payloadField,
          bind: null,
          span: this.spanFrom(start, end),
        };
      }

      const end = this.endTok();
      throw new Error(
        `Invalid pattern '${t.value}': bare identifier patterns are not supported (use '_' or a literal, or an enum variant like Ok(x))`,
      );
    }

    if (this.match("number")) {
      const t = this.previous("number");
      const end = this.endTok();
      return {
        type: "LiteralPattern",
        value: { type: "IntLiteral", value: t.value, span: t.span },
        span: this.spanFrom(start, end),
      };
    }

    if (this.match("true")) {
      const t = this.previous("true");
      const end = this.endTok();
      return {
        type: "LiteralPattern",
        value: { type: "BoolLiteral", value: true, span: t.span },
        span: this.spanFrom(start, end),
      };
    }

    if (this.match("false")) {
      const t = this.previous("false");
      const end = this.endTok();
      return {
        type: "LiteralPattern",
        value: { type: "BoolLiteral", value: false, span: t.span },
        span: this.spanFrom(start, end),
      };
    }

    throw new Error("Invalid match pattern");
  }

  private parseExpression(): Expression {
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): Expression {
    let expr = this.parseLogicalAnd();

    while (true) {
      const op = this.peekOperator();
      if (!op || op.value !== "||") break;

      const start = expr.span;
      this.expect("operator");
      const right = this.parseLogicalAnd();
      const end = right.span;

      expr = {
        type: "BinaryExpr",
        operator: "||",
        left: expr,
        right,
        span: mergeSpan(start, end),
      };
    }

    return expr;
  }

  private parseLogicalAnd(): Expression {
    let expr = this.parseEquality();

    while (true) {
      const op = this.peekOperator();
      if (!op || op.value !== "&&") break;

      const start = expr.span;
      this.expect("operator");
      const right = this.parseEquality();
      const end = right.span;

      expr = {
        type: "BinaryExpr",
        operator: "&&",
        left: expr,
        right,
        span: mergeSpan(start, end),
      };
    }

    return expr;
  }

  private parseUnary(): Expression {
    const op = this.peekOperator();
    if (op && op.value === "!") {
      const startTok = this.startTok();
      this.expect("operator");
      const operand = this.parseUnary();
      const endTok = this.endTok();
      return {
        type: "UnaryExpr",
        operator: "!",
        operand,
        span: this.spanFrom(startTok, endTok),
      };
    }

    return this.parsePostfix();
  }

  private parseEquality(): Expression {
    let expr = this.parseComparison();

    while (true) {
      const op = this.peekOperator();
      if (!op || (op.value !== "==" && op.value !== "!=")) break;

      const start = expr.span;
      const opVal = op.value;
      this.expect("operator");
      const right = this.parseComparison();
      const end = right.span;

      expr = {
        type: "BinaryExpr",
        operator: opVal,
        left: expr,
        right,
        span: mergeSpan(start, end),
      };
    }

    return expr;
  }

  private parseComparison(): Expression {
    let expr = this.parseAdditive();

    while (true) {
      const op = this.peekOperator();
      if (!op || !["<", "<=", ">", ">="].includes(op.value)) break;

      const start = expr.span;
      const opVal = op.value;
      this.expect("operator");
      const right = this.parseAdditive();
      const end = right.span;

      expr = {
        type: "BinaryExpr",
        operator: opVal,
        left: expr,
        right,
        span: mergeSpan(start, end),
      };
    }

    return expr;
  }

  private parseAdditive(): Expression {
    let expr = this.parseMultiplicative();

    while (true) {
      const op = this.peekOperator();
      if (!op || (op.value !== "+" && op.value !== "-")) break;

      const start = expr.span;
      const opVal = op.value;
      this.expect("operator");
      const right = this.parseMultiplicative();
      const end = right.span;

      expr = {
        type: "BinaryExpr",
        operator: opVal,
        left: expr,
        right,
        span: mergeSpan(start, end),
      };
    }

    return expr;
  }

  private parseMultiplicative(): Expression {
    let expr = this.parseUnary();

    while (true) {
      const op = this.peekOperator();
      if (!op || (op.value !== "*" && op.value !== "/")) break;

      const start = expr.span;
      const opVal = op.value;
      this.expect("operator");
      const right = this.parseUnary();
      const end = right.span;

      expr = {
        type: "BinaryExpr",
        operator: opVal,
        left: expr,
        right,
        span: mergeSpan(start, end),
      };
    }

    return expr;
  }

  private parsePostfix(): Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match("lparen")) {
        const callStart = expr.span;

        const args: Expression[] = [];
        if (!this.check("rparen")) {
          do {
            args.push(this.parseExpression());
          } while (this.match("comma"));
        }
        this.expect("rparen");
        const callEnd = this.endTok().span;

        if (expr.type === "Identifier") {
          const identName = expr.name;
          const info = this.resolveVariant(identName);

          if (info) {
            const { enumName, payloadField } = info;
            const payload = args.length ? args[0] : null;

            expr = {
              type: "EnumLiteral",
              enumName,
              variant: identName,
              payloadField,
              payload,
              span: mergeSpan(callStart, callEnd),
            };
            continue;
          }
        }

        expr = {
          type: "CallExpr",
          callee: expr,
          args,
          span: mergeSpan(callStart, callEnd),
        };
        continue;
      }

      if (this.check("lbrace")) {
        if (expr.type === "Identifier" && this.structs.has(expr.name)) {
          const lit = this.parseStructLiteral(expr.name, expr.span);
          expr = lit;
          continue;
        }

        const upd = this.parseStructUpdate(expr);
        expr = upd;
        continue;
      }

      break;
    }

    return expr;
  }

  private parsePrimary(): Expression {
    if (this.match("true")) {
      const t = this.previous("true");
      return { type: "BoolLiteral", value: true, span: t.span };
    }

    if (this.match("false")) {
      const t = this.previous("false");
      return { type: "BoolLiteral", value: false, span: t.span };
    }

    if (this.match("number")) {
      const t = this.previous("number");
      return { type: "IntLiteral", value: t.value, span: t.span };
    }

    if (this.match("string")) {
      const t = this.previous("string");
      const node =
        t.value.includes("{") && t.value.includes("}")
          ? this.parseInterpString(t.value, t.span)
          : ({
              type: "StringLiteral",
              value: t.value,
              span: t.span,
            } as Expression);
      return node;
    }

    if (this.match("identifier")) {
      const t = this.previous("identifier");
      return { type: "Identifier", name: t.value, span: t.span };
    }

    if (this.match("match")) {
      const start = this.previous("match");
      return this.parseMatch(start) as any;
    }

    if (this.match("if")) {
      const start = this.previous("if");
      return this.parseIfExpr(start);
    }

    if (this.match("lparen")) {
      const start = this.previous("lparen");
      const expr = this.parseExpression();
      this.expect("rparen");
      const end = this.endTok();
      return { ...(expr as any), span: this.spanFrom(start, end) };
    }

    if (this.check("lbrace")) {
      return this.parseBlock();
    }

    throw new Error(`Unexpected token: ${JSON.stringify(this.peek())}`);
  }

  private parseInterpString(raw: string, span: Span): Expression {
    const parts: any[] = [];
    let i = 0;

    const pushText = (s: string) => {
      if (!s.length) return;
      parts.push({
        type: "Text",
        value: s,
        span,
      });
    };

    while (i < raw.length) {
      const open = raw.indexOf("{", i);
      if (open === -1) {
        pushText(raw.slice(i));
        break;
      }

      pushText(raw.slice(i, open));

      const close = raw.indexOf("}", open + 1);
      if (close === -1)
        throw new Error("Unterminated interpolation: missing '}'");

      const inside = raw.slice(open + 1, close).trim();
      if (!inside.length) throw new Error("Empty interpolation: {}");

      const innerTokens = lex(inside);
      const inner = new Parser(innerTokens).parseExpressionOnly();

      parts.push({
        type: "Expr",
        expr: inner,
        span,
      });

      i = close + 1;
    }

    return { type: "InterpString", parts, raw: false, span };
  }

  private parseStructUpdate(target: Expression): StructUpdateExpr {
    const start = target.span;
    this.expect("lbrace");

    const fields: { name: string; value: Expression; span: Span }[] = [];

    while (!this.check("rbrace")) {
      const fStart = this.startTok();
      const fieldName = this.expect("identifier").value;
      this.expect("colon");
      const value = this.parseExpression();
      const fEnd = this.endTok();
      fields.push({
        name: fieldName,
        value,
        span: this.spanFrom(fStart, fEnd),
      });
      this.match("comma");
    }

    this.expect("rbrace");
    const end = this.endTok().span;

    return {
      type: "StructUpdateExpr",
      target,
      fields,
      span: mergeSpan(start, end),
    };
  }

  private parseStructLiteral(name: string, startSpan: Span): StructLiteral {
    const startTok = this.startTok();
    this.expect("lbrace");

    const fields: { name: string; value: Expression; span: Span }[] = [];

    while (!this.check("rbrace")) {
      const fStart = this.startTok();
      const fieldName = this.expect("identifier").value;
      this.expect("colon");
      const value = this.parseExpression();
      const fEnd = this.endTok();
      fields.push({
        name: fieldName,
        value,
        span: this.spanFrom(fStart, fEnd),
      });
      this.match("comma");
    }

    this.expect("rbrace");
    const endTok = this.endTok();

    return {
      type: "StructLiteral",
      name,
      fields,
      span: mergeSpan(startSpan, this.spanFrom(startTok, endTok)),
    };
  }

  public parseExpressionOnly(): Expression {
    const expr = this.parseExpression();
    this.expect("eof");
    return expr;
  }

  private parseTypeNode(): TypeNode {
    const start = this.startTok();
    const name = this.expect("identifier").value;
    const end = this.endTok();

    if (name === "Any")
      return { type: "AnyType", span: this.spanFrom(start, end) };
    return { type: "NamedType", name, span: this.spanFrom(start, end) };
  }

  private parseOptionalTypeAnn(): TypeNode | null {
    if (!this.match("colon")) return null;
    return this.parseTypeNode();
  }

  private parseOptionalReturnType(): TypeNode | null {
    if (!this.match("colon")) return null;
    return this.parseTypeNode();
  }

  private match<T extends TokenType>(type: T): boolean {
    if (this.check(type)) {
      this.pos++;
      return true;
    }
    return false;
  }

  private expect<T extends TokenType>(type: T): TokenOf<T> {
    if (this.check(type)) return this.tokens[this.pos++] as TokenOf<T>;
    throw new Error(`Expected ${type} but got ${JSON.stringify(this.peek())}`);
  }

  private check<T extends TokenType>(type: T): boolean {
    return this.peek().type === type;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private previous<T extends TokenType>(
    type?: T,
  ): T extends TokenType ? TokenOf<T> : Token {
    return this.tokens[this.pos - 1] as any;
  }

  private peekOperator(): TokenOf<"operator"> | null {
    const t = this.peek();
    return t.type === "operator" ? t : null;
  }

  private resolveVariant(
    variant: string,
  ): { enumName: string; payloadField: string | null } | null {
    const hits: { enumName: string; payloadField: string | null }[] = [];
    for (const [enumName, table] of this.enums.entries()) {
      if (table.has(variant))
        hits.push({ enumName, payloadField: table.get(variant)! });
    }
    if (hits.length === 0) return null;
    if (hits.length > 1)
      throw new Error(
        `Ambiguous variant '${variant}' (exists in multiple enums)`,
      );
    return hits[0];
  }

  private spanFrom(start: Token, end: Token): Span {
    return mergeSpan(start.span, end.span);
  }

  private startTok(): Token {
    return this.peek();
  }

  private endTok(): Token {
    return this.previous() as Token;
  }
}
