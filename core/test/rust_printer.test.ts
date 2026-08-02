import { test } from "uvu";
import * as assert from "uvu/assert";
import { lex } from "../compiler/lexer.js";
import { Parser } from "../compiler/parser.js";
import { printRust } from "../compiler/rust_printer.js";

test("rust_printer converts simple Zyra program to Rust", () => {
  const source = `
struct User {
  id: String
  age: Int
}

enum Result {
  Ok(value: String)
  Err
}

def add(a: Int, b: Int): Int {
  a + b
}

const id = "u1"
const u = User { id: id, age: 30 }
print("User name: {id}")
`;

  const tokens = lex(source);
  const parser = new Parser(tokens);
  const program = parser.parseProgram();

  const rustCode = printRust(program, { entry: true });

  assert.ok(rustCode.includes("pub struct User {"));
  assert.ok(rustCode.includes("pub id: String,"));
  assert.ok(rustCode.includes("pub age: i64,"));
  assert.ok(rustCode.includes("pub enum Result {"));
  assert.ok(rustCode.includes("Ok { value: String },"));
  assert.ok(rustCode.includes("fn add(a: i64, b: i64) -> i64 {"));
  assert.ok(rustCode.includes("pub fn main() {"));
  assert.ok(rustCode.includes("User { id: id.clone(), age: 30 }"));
});

test("rust_printer handles match expressions and struct updates", () => {
  const source = `
enum Result {
  Ok(value: String)
  Err
}

const u2 = u { age: 31 }

const name = match (r) {
  Ok(val) => val
  _ => "default"
}
`;

  const tokens = lex(source);
  const parser = new Parser(tokens);
  const program = parser.parseProgram();

  const rustCode = printRust(program, { entry: true });

  assert.ok(rustCode.includes("u { age: 31, ..u.clone() }"));
  assert.ok(rustCode.includes("match r {"));
  assert.ok(rustCode.includes("Result::Ok { value: val } => val,"));
  assert.ok(rustCode.includes("_ => String::from(\"default\"),"));
});

export const rustPrinterSuite = test;

