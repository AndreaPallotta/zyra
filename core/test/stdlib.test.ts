import { test } from "uvu";
import * as assert from "uvu/assert";
import { lex } from "../compiler/lexer.js";
import { Parser } from "../compiler/parser.js";
import { check } from "../compiler/checker.js";
import { print } from "../compiler/printer.js";
import { printRust } from "../compiler/rust_printer.js";

test("stdlib built-ins pass type checking and emit correct JS & Rust", () => {
  const source = `
const s = " Hello Zyra "
const trimmed = trim(s)
const l = len(trimmed)
const sub = substr(trimmed, 0, 5)
const hasZyra = contains(trimmed, "Zyra")
const numStr = str(42)
const val = parse_int("100")
const content = file_read("test.txt")
const saved = file_write("out.txt", content)
`;

  const tokens = lex(source);
  const parser = new Parser(tokens);
  const program = parser.parseProgram();

  const diags = check(program);
  const errors = diags.filter((d) => d.level === "error");
  assert.is(errors.length, 0);

  const jsCode = print(program, { entry: true });
  assert.ok(jsCode.includes(".trim()"));
  assert.ok(jsCode.includes(".length"));
  assert.ok(jsCode.includes(".substring(0, 0 + 5)"));
  assert.ok(jsCode.includes(".includes(\"Zyra\")"));

  const rustCode = printRust(program, { entry: true });
  assert.ok(rustCode.includes(".trim().to_string()"));
  assert.ok(rustCode.includes(".len() as i64"));
  assert.ok(rustCode.includes(".contains(&("));
  assert.ok(rustCode.includes("std::fs::read_to_string"));
  assert.ok(rustCode.includes("std::fs::write"));
});

export const stdlibSuite = test;
