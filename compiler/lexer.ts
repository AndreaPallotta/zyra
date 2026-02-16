import type { Span } from "./span.js";

type TokBase = { span: Span };

export type Token =
  | ({ type: "from" } & TokBase)
  | ({ type: "import" } & TokBase)
  | ({ type: "path"; value: string } & TokBase)
  | ({ type: "const" } & TokBase)
  | ({ type: "var" } & TokBase)
  | ({ type: "def" } & TokBase)
  | ({ type: "true" } & TokBase)
  | ({ type: "false" } & TokBase)
  | ({ type: "identifier"; value: string } & TokBase)
  | ({ type: "number"; value: number } & TokBase)
  | ({ type: "string"; value: string; quote: "'" | '"' } & TokBase)
  | ({ type: "operator"; value: string } & TokBase)
  | ({ type: "equals" } & TokBase)
  | ({ type: "lparen" } & TokBase)
  | ({ type: "rparen" } & TokBase)
  | ({ type: "lbrace" } & TokBase)
  | ({ type: "rbrace" } & TokBase)
  | ({ type: "comma" } & TokBase)
  | ({ type: "if" } & TokBase)
  | ({ type: "else" } & TokBase)
  | ({ type: "semicolon" } & TokBase)
  | ({ type: "match" } & TokBase)
  | ({ type: "arrow" } & TokBase)
  | ({ type: "struct" } & TokBase)
  | ({ type: "colon" } & TokBase)
  | ({ type: "enum" } & TokBase)
  | ({ type: "export" } & TokBase)
  | ({ type: "print" } & TokBase)
  | ({ type: "print_raw" } & TokBase)
  | ({ type: "return" } & TokBase)
  | ({ type: "eof" } & TokBase);

export function lex(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let col = 1;

  function peek() {
    return input[i];
  }

  function advance() {
    const ch = input[i++];
    if (ch === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  }

  function isAlpha(c: string) {
    return /[a-zA-Z_]/.test(c);
  }

  function isAlphaNumeric(c: string) {
    return /[a-zA-Z0-9_]/.test(c);
  }

  function isDigit(c: string) {
    return /[0-9]/.test(c);
  }

  function makeSpan(
    start: number,
    end: number,
    startLine: number,
    startCol: number,
  ): Span {
    return { start, end, line: startLine, col: startCol };
  }

  while (i < input.length) {
    const c = peek();

    if (/\s/.test(c)) {
      advance();
      continue;
    }

    if (c === "/" && input[i + 1] === "/") {
      while (i < input.length && input[i] !== "\n") advance();
      continue;
    }

    if (c === "/" && input[i + 1] === "*") {
      advance();
      advance();
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) {
        advance();
      }
      advance();
      advance();
      continue;
    }

    if (isAlpha(c)) {
      const start = i;
      const sl = line;
      const sc = col;
      let value = "";
      while (i < input.length && isAlphaNumeric(peek())) value += advance();
      const end = i;
      const sp = makeSpan(start, end, sl, sc);

      if (value === "const") tokens.push({ type: "const", span: sp });
      else if (value === "var") tokens.push({ type: "var", span: sp });
      else if (value === "def") tokens.push({ type: "def", span: sp });
      else if (value === "true") tokens.push({ type: "true", span: sp });
      else if (value === "false") tokens.push({ type: "false", span: sp });
      else if (value === "if") tokens.push({ type: "if", span: sp });
      else if (value === "else") tokens.push({ type: "else", span: sp });
      else if (value === "match") tokens.push({ type: "match", span: sp });
      else if (value === "struct") tokens.push({ type: "struct", span: sp });
      else if (value === "enum") tokens.push({ type: "enum", span: sp });
      else if (value === "from") tokens.push({ type: "from", span: sp });
      else if (value === "import") tokens.push({ type: "import", span: sp });
      else if (value === "export") tokens.push({ type: "export", span: sp });
      else if (value === "print") tokens.push({ type: "print", span: sp });
      else if (value === "print_raw")
        tokens.push({ type: "print_raw", span: sp });
      else if (value === "return") tokens.push({ type: "return", span: sp });
      else tokens.push({ type: "identifier", value, span: sp });

      continue;
    }

    if (isDigit(c)) {
      const start = i;
      const sl = line;
      const sc = col;
      let value = "";
      while (i < input.length && isDigit(peek())) value += advance();
      const end = i;

      tokens.push({
        type: "number",
        value: Number(value),
        span: makeSpan(start, end, sl, sc),
      });
      continue;
    }

    if (c === "@") {
      const start = i;
      const sl = line;
      const sc = col;
      let value = "";
      while (i < input.length && /[@a-zA-Z0-9_\/-]/.test(peek()))
        value += advance();
      const end = i;

      tokens.push({ type: "path", value, span: makeSpan(start, end, sl, sc) });
      continue;
    }

    if (c === "=" && input[i + 1] === ">") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      advance();
      tokens.push({ type: "arrow", span: makeSpan(start, i, sl, sc) });
      continue;
    }

    if (c === "=") {
      const start = i;
      const sl = line;
      const sc = col;
      if (input[i + 1] === "=") {
        advance();
        advance();
        tokens.push({
          type: "operator",
          value: "==",
          span: makeSpan(start, i, sl, sc),
        });
      } else {
        advance();
        tokens.push({ type: "equals", span: makeSpan(start, i, sl, sc) });
      }
      continue;
    }

    if (c === "!" && input[i + 1] === "=") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      advance();
      tokens.push({
        type: "operator",
        value: "!=",
        span: makeSpan(start, i, sl, sc),
      });
      continue;
    }

    if (c === "<") {
      const start = i;
      const sl = line;
      const sc = col;
      if (input[i + 1] === "=") {
        advance();
        advance();
        tokens.push({
          type: "operator",
          value: "<=",
          span: makeSpan(start, i, sl, sc),
        });
      } else {
        advance();
        tokens.push({
          type: "operator",
          value: "<",
          span: makeSpan(start, i, sl, sc),
        });
      }
      continue;
    }

    if (c === ">") {
      const start = i;
      const sl = line;
      const sc = col;
      if (input[i + 1] === "=") {
        advance();
        advance();
        tokens.push({
          type: "operator",
          value: ">=",
          span: makeSpan(start, i, sl, sc),
        });
      } else {
        advance();
        tokens.push({
          type: "operator",
          value: ">",
          span: makeSpan(start, i, sl, sc),
        });
      }
      continue;
    }

    if (c === "&" && input[i + 1] === "&") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      advance();
      tokens.push({
        type: "operator",
        value: "&&",
        span: makeSpan(start, i, sl, sc),
      });
      continue;
    }

    if (c === "|" && input[i + 1] === "|") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      advance();
      tokens.push({
        type: "operator",
        value: "||",
        span: makeSpan(start, i, sl, sc),
      });
      continue;
    }

    if (c === "!") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      tokens.push({
        type: "operator",
        value: "!",
        span: makeSpan(start, i, sl, sc),
      });
      continue;
    }

    if (c === '"' || c === "'") {
      const start = i;
      const sl = line;
      const sc = col;
      const quote = advance() as "'" | '"';
      let value = "";

      while (i < input.length && peek() !== quote) value += advance();

      if (peek() !== quote) throw new Error("Unterminated string");

      advance();
      tokens.push({
        type: "string",
        value,
        quote,
        span: makeSpan(start, i, sl, sc),
      });
      continue;
    }

    if (c === ";") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      tokens.push({ type: "semicolon", span: makeSpan(start, i, sl, sc) });
      continue;
    }

    if (c === ":") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      tokens.push({ type: "colon", span: makeSpan(start, i, sl, sc) });
      continue;
    }

    if (["+", "-", "*", "/"].includes(c)) {
      const start = i;
      const sl = line;
      const sc = col;
      const v = advance();
      tokens.push({
        type: "operator",
        value: v,
        span: makeSpan(start, i, sl, sc),
      });
      continue;
    }

    if (c === "(") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      tokens.push({ type: "lparen", span: makeSpan(start, i, sl, sc) });
      continue;
    }

    if (c === ")") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      tokens.push({ type: "rparen", span: makeSpan(start, i, sl, sc) });
      continue;
    }

    if (c === "{") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      tokens.push({ type: "lbrace", span: makeSpan(start, i, sl, sc) });
      continue;
    }

    if (c === "}") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      tokens.push({ type: "rbrace", span: makeSpan(start, i, sl, sc) });
      continue;
    }

    if (c === ",") {
      const start = i;
      const sl = line;
      const sc = col;
      advance();
      tokens.push({ type: "comma", span: makeSpan(start, i, sl, sc) });
      continue;
    }

    throw new Error(`Unexpected character: ${c}`);
  }

  tokens.push({ type: "eof", span: { start: i, end: i, line, col } });
  return tokens;
}
