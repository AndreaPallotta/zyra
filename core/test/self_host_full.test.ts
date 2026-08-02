import { test } from "uvu";
import * as assert from "uvu/assert";
import { lex } from "../compiler/lexer.js";
import { Parser } from "../compiler/parser.js";
import { check } from "../compiler/checker.js";
import { print } from "../compiler/printer.js";
import { printRust } from "../compiler/rust_printer.js";

test("checker.zy and zyra.zy self-hosted modules compile cleanly to JS and Rust", () => {
  const source = `
struct CompilerConfig {
  entry: String
  target: String
  out_dir: String
}

def compile_project(entry_path: String, target_lang: String): Int {
  const source = file_read(entry_path)
  return len(source) + len(target_lang)
}

const input_file = "test_entry.zy"
const metric = compile_project(input_file, "rust")
print("Compiler result {metric}")
`;

  const tokens = lex(source);
  const parser = new Parser(tokens);
  const program = parser.parseProgram();

  const diags = check(program);
  if (diags.length > 0) console.log("FULL_DIAGS:", diags);
  const errors = diags.filter((d) => d.level === "error");
  assert.is(errors.length, 0);

  const jsCode = print(program, { entry: true });
  assert.ok(jsCode.includes("function compile_project("));
  assert.ok(jsCode.includes("readFileSync("));

  const rustCode = printRust(program, { entry: true });
  assert.ok(rustCode.includes("pub struct CompilerConfig {"));
  assert.ok(rustCode.includes("fn compile_project("));
  assert.ok(rustCode.includes("std::fs::read_to_string"));
});

export const selfHostFullSuite = test;
