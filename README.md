# Zyra Language Specification (v0)

<p align="center">
  <img src="assets/zyra_128x128.png" alt="Zyra logo" width="128" />
</p>

Zyra is a strict, expression-oriented programming language that compiles to modern browser-native JavaScript (ESM) with **zero runtime library**.

It prioritizes:
- Explicitness over magic
- Immutable data structures (structs)
- Strict typing without type-level complexity
- Predictable async behavior
- Canonical formatting (no style configuration)
- Clean interop with the web platform

---

## Workspace Structure

This repository is organized as an npm monorepo workspace:
- **[core/](file:///desktop/projects/zyra/core)**: Core Zyra compiler (lexer, parser, type checker, and ESM code printer).
- **[lsp/](file:///desktop/projects/zyra/lsp)**: Zyra Language Server Protocol (LSP) server implementing diagnostic, hover, and definition providers.
- **[vscode/](file:///desktop/projects/zyra/vscode)**: VS Code extension integrating the language client and TextMate grammar for `.zy` files.

---

## Tooling & IDE Support

The **Zyra VS Code Extension** integrates the custom LSP server to provide:
- **Diagnostics**: Real-time syntax and type checking errors/warnings reported directly in the editor.
- **Hover Tooltips**: Formatted type signatures (e.g. `double: fn(Int) -> Int`) shown when hovering over variables, functions, and structs.
- **Go to Definition**: Jump directly to variable or function declarations in the source code.
- **Syntax Highlighting**: Complete language syntax highlighting for variables, comments, functions, and structs.

---

## Development & Building

Manage the workspaces from the root of the repository:

### Install dependencies
```bash
npm install
```

### Build all packages
```bash
# Compiles core and packages/bundles the LSP server into the extension folder
npm run build -w core && npm run build -w vscode
```

---

# Language Specification

The detailed syntax rules, types, philosophy, and constraints of the language are documented in the [Zyra Language Specification (SPEC.md)](file:///desktop/projects/zyra/SPEC.md).

---

# CLI
```zy
zyra fmt
zyra check
zyra build
zyra run
```

