# Interactive Zyra REPL Engine Specification

## Overview

Redesign the `zyra repl` shell into a fully interactive evaluation environment capable of incrementally parsing, type-checking, compiling, and executing Zyra statements, variable declarations, and function definitions in real time.

---

## REPL Requirements & Capabilities

### 1. Incremental State Persistence
- Maintain an active evaluation state across user inputs.
- Variable bindings (`const x = 42`, `var name = "Blake"`) remain in scope for subsequent lines.
- Top-level function definitions (`def greet(name: String): String { ... }`) are parsed and added to the environment scope.

### 2. Multi-Line Input Buffer
- When a user opens a function block or struct definition (`def foo() {`), the prompt automatically switches to `... ` for multi-line continuation until braces are closed.

### 3. Immediate Expression Evaluation & Execution
- Expressions (`2 + 3`, `greet("Blake")`) immediately evaluate and print their return values (`=> 5`, `=> "Welcome, Blake!"`).
- `print(...)` statements output directly to stdout.

### 4. Built-in Shell Meta-Commands
- `:help` / `:h` — Display REPL help menu.
- `:vars` — List all currently active variable bindings and types.
- `:funcs` — List all defined functions.
- `:clear` — Clear the screen and reset environment state.
- `:exit` / `exit` / `quit` — Exit the REPL shell.

---

## Technical Architecture

### 1. In-Memory AST Accumulator
- Accumulates top-level AST declarations (`FunctionDecl`, `StructDecl`, `VarDecl`).
- Evaluates input by wrapping single expressions or statements in transient evaluation blocks.

### 2. Fast JIT Execution Backend
- Compiles incremental inputs using Node ESM eval or fast native JIT execution via dynamic Rust shared library symbol loading / temp compilation.
