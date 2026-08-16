# Zyra CLI Tooling Reference

The Zyra command-line interface (`zyra`) is a single unified binary driver for bootstrapping projects, compiling source code, executing test suites, auditing security risks, formatting code, and managing package dependencies.

---

## Command Overview

```bash
zyra <command> [options]
```

| Command | Usage | Description |
| :--- | :--- | :--- |
| [`init`](#project-initialization-and-templates) | `zyra init <project-name>` | Initializes a new Zyra project directory with default config files. |
| [`create`](#project-initialization-and-templates) | `zyra create <template> <name>` | Bootstraps project template (`cli`, `web`, `wasm`). |
| [`build`](#compilation-and-execution) | `zyra build <file.zy> [js\|wasm32]` | Compiles a `.zy` source file into a native binary, WASM, or JS ESM module. |
| [`run`](#compilation-and-execution) | `zyra run <file.zy>` | Compiles and executes a Zyra file in one step. |
| [`watch`](#compilation-and-execution) | `zyra watch <file.zy>` | Launches a live dev server watching for source file modifications. |
| [`test`](#testing-benchmarking-and-profiling) | `zyra test` | Executes project test suites and reports pass or fail metrics. |
| [`bench`](#testing-benchmarking-and-profiling) | `zyra bench` | Runs performance benchmarks with nanosecond timing resolution. |
| [`profile`](#testing-benchmarking-and-profiling) | `zyra profile <file.zy>` | Samples CPU hotspots and generates a Flamegraph SVG visualization. |
| [`audit`](#code-quality-and-security) | `zyra audit` | Scans codebase and lockfiles for hardcoded secrets and unverified packages. |
| [`lint`](#code-quality-and-security) | `zyra lint` | Performs static analysis checking for code smells and unused variables. |
| [`fmt`](#code-quality-and-security) | `zyra fmt <file.zy>` | Automatically formats Zyra source code syntax. |
| [`add`](#package-management) | `zyra add <github.com/usr/repo>` | Adds a Git package dependency to `zyra.json`. |
| [`pkg`](#package-management) | `zyra pkg` | Resolves and downloads project dependencies into `.zyra_modules/`. |
| [`lsp`](#developer-tools-and-repl) | `zyra lsp` | Launches the Zyra Language Server over stdio for IDE integration. |
| [`repl`](#developer-tools-and-repl) | `zyra repl` | Starts an interactive terminal REPL shell. |

---

## Project Initialization and Templates

### `zyra init <project-name>`
Creates a new directory containing `src/main.zy` and `zyra.json`.

```bash
zyra init my-app
cd my-app
```

### `zyra create <template> <name>`
Bootstraps pre-configured project templates:
- `cli`: Command-line interface application.
- `web`: Embedded HTTP web server application.
- `wasm`: WebAssembly module template.

```bash
zyra create web my-web-server
```

---

## Compilation and Execution

### `zyra build <file.zy> [options]`
Compiles a Zyra application into target output binaries:

```bash
# Compile to native binary (dist/main.exe)
zyra build src/main.zy

# Compile to JavaScript ESM module (dist/main.mjs)
zyra build src/main.zy js

# Compile to WebAssembly module (dist/main.wasm)
zyra build src/main.zy wasm32
```

### `zyra run <file.zy>`
Compiles and runs a source file instantly in a single command. Incremental caching speeds up re-execution.

```bash
zyra run src/main.zy
```

### `zyra watch <file.zy>`
Monitors source files for edits and automatically recompiles and runs the application on file save.

```bash
zyra watch src/main.zy
```

---

## Testing, Benchmarking, and Profiling

### `zyra test`
Discovers and runs test routines, validating assertions and reporting overall pass/fail metrics.

```bash
zyra test
```

### `zyra bench`
Runs micro-benchmarks across functions and displays execution latency statistics.

```bash
zyra bench
```

### `zyra profile <file.zy>`
Executes CPU sampling on the target file and outputs an interactive SVG Flamegraph to `dist/flamegraph.svg`.

```bash
zyra profile src/main.zy
```

---

## Code Quality and Security

### `zyra audit`
Scans source files for hardcoded API keys, exposed private keys, unverified package lockfiles, and untracked `zyra.env` configuration files.

```bash
zyra audit
```

### `zyra fmt <file.zy>`
Formats standard indentation, braces, and line spacing according to Zyra style guidelines.

```bash
zyra fmt src/main.zy
```

---

## Package Management

### `zyra add <github.com/user/repo>`
Adds a remote Git package dependency to `zyra.json`.

```bash
zyra add github.com/zyra-lang/sample-lib
```

### `zyra pkg`
Reads `zyra.json` dependencies, clones remote repositories into `.zyra_modules/`, and updates `zyra.lock` with SHA-256 integrity checksums.

```bash
zyra pkg
```

---

## Developer Tools and REPL

### `zyra lsp`
Runs the Language Server Protocol over stdio, serving autocomplete, diagnostics, and hover documentation to VS Code and language clients.

### `zyra repl`
Launches an interactive terminal session for trying out expressions, types, and functions.

```bash
zyra repl
```
