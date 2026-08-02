import { test } from "uvu";
import * as assert from "uvu/assert";
import { lex } from "../compiler/lexer.js";
import { Parser } from "../compiler/parser.js";
import { check } from "../compiler/checker.js";
import { print } from "../compiler/printer.js";
import { printRust } from "../compiler/rust_printer.js";

test("lexer.zy self-hosted module compiles cleanly to JS and Rust", () => {
  const source = `
struct Token {
  kind: String
  text: String
  line: Int
  col: Int
}

def is_space(c: String): Bool {
  return contains(" \\t\\r\\n", c)
}

def is_digit_c(c: String): Bool {
  return contains("0123456789", c)
}

def run_lexer(file_path: String): Int {
  const source = file_read(file_path)
  const source_len = len(source)
  return source_len
}

const target = "sample.zy"
const count = run_lexer(target)
print("Lexer tokenized length {count}")
`;

  const tokens = lex(source);
  const parser = new Parser(tokens);
  const program = parser.parseProgram();

  const diags = check(program);
  const errors = diags.filter((d) => d.level === "error");
  assert.is(errors.length, 0);

  const jsCode = print(program, { entry: true });
  assert.ok(jsCode.includes("function run_lexer("));
  assert.ok(jsCode.includes("readFileSync("));

  const rustCode = printRust(program, { entry: true });
  assert.ok(rustCode.includes("pub struct Token {"));
  assert.ok(rustCode.includes("fn run_lexer("));
  assert.ok(rustCode.includes("std::fs::read_to_string"));
});

export const selfHostLexerSuite = test;
