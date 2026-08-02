import { test } from "uvu";
import * as assert from "uvu/assert";
import { lex } from "../compiler/lexer.js";
import { Parser } from "../compiler/parser.js";
import { check } from "../compiler/checker.js";
import { print } from "../compiler/printer.js";
import { printRust } from "../compiler/rust_printer.js";

test("parser.zy self-hosted module compiles cleanly to JS and Rust", () => {
  const source = `
struct ASTNode {
  kind: String
  name: String
  type_ann: String
  child_count: Int
}

def parse_var_decl(name: String, type_ann: String): ASTNode {
  return ASTNode {
    kind: "VarDecl",
    name: name,
    type_ann: type_ann,
    child_count: 1
  }
}

def parse_file_ast(file_path: String): Int {
  const code = file_read(file_path)
  const _ = parse_var_decl("x", "Int")
  return len(code)
}

const file_name = "test_parse.zy"
const total = parse_file_ast(file_name)
print("Parser node count {total}")
`;

  const tokens = lex(source);
  const parser = new Parser(tokens);
  const program = parser.parseProgram();

  const diags = check(program);
  const errors = diags.filter((d) => d.level === "error");
  assert.is(errors.length, 0);

  const jsCode = print(program, { entry: true });
  assert.ok(jsCode.includes("function parse_var_decl("));
  assert.ok(jsCode.includes("readFileSync("));

  const rustCode = printRust(program, { entry: true });
  assert.ok(rustCode.includes("pub struct ASTNode {"));
  assert.ok(rustCode.includes("fn parse_var_decl("));
  assert.ok(rustCode.includes("std::fs::read_to_string"));
});

export const selfHostParserSuite = test;
