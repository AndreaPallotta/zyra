# Zyra Compiler (`zyra-ts`)

This package is the core compiler and programmatic API for **Zyra**, a strict, expression-oriented programming language compiling to modern, browser-native JavaScript (ESM) with zero runtime library dependency.

## Installation

```bash
npm install zyra-ts
```

## CLI Usage

```bash
zyra fmt      # Formats source files to canonical style
zyra check    # Type-checks the project
zyra build    # Compiles .zy files to .js
zyra run      # Runs the compiled entry point
```

## Programmatic API Usage

You can also use the compiler programmatically in Node.js/TypeScript:

```typescript
import { Parser, check, print } from 'zyra-ts';

// 1. Parse source code
const parser = new Parser(sourceCode);
const ast = parser.parseModule();

// 2. Type check
const { errors } = check(ast);

// 3. Print compiled JavaScript
const jsCode = print(ast);
```

## Language Specification

For complete details about syntax, variables, enums, structs, and async semantics, see the [Zyra Language Specification (SPEC.md)](SPEC.md).
