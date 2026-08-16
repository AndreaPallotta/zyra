# Zyra Programming Language

**Zyra** is a fast, expressive, statically-typed compiled programming language designed to combine the performance, safety, and type system of **Rust** with the clean simplicity and developer velocity of **Go**.

![Zyra Code Showcase](https://raw.githubusercontent.com/AndreaPallotta/zyra/main/assets/zyra_512x512.png){ align=left width=150 }

!!! tip "Zyra Compiler Core and Toolchain"
    Zyra features a **100% self-hosted compiler core** written in pure Zyra. It targets **Native Standalone Binaries**, **WebAssembly (`wasm32`)**, and **JavaScript ESM Modules (`.mjs`)**.

---

## Key Features

- **Zero-Import Dot-Notation Namespacing**: Access standard library routines directly (`env.get()`, `path.join()`, `math.sqrt()`, `str.split()`, `io.read()`, `crypto.sha256()`, `http.get()`) without explicit import headers.
- **Structured `zyra.env` Environment Configuration**: Parse hierarchical YAML-style configuration files (`server.port`, `database.url`) natively via `env.load("zyra.env")`.
- **Non-Callback Async File Watcher**: Monitor file system updates asynchronously (`io.watch()`, `io.has_changed()`) without callback nesting.
- **Zero-Overhead Native and JS ESM Executables**: Compiles down to native binaries via `rustc` and standalone `.mjs` JavaScript ESM modules.
- **Go-Style Package Resolution**: Install remote Git repositories (`zyra add github.com/user/repo`) with SHA-256 integrity lockfiles (`zyra.lock`).
- **Seamless Rust and Cargo Ecosystem Bridging**: Import any Cargo crate directly (`import rust "reqwest@0.12"`) or write inline `rust { ... }` blocks inside Zyra functions.
- **Multi-File Module Imports**: Link complex project directory trees with `import "./module.zy"`.
- **Traits and Interfaces (`trait` and `impl`)**: Polymorphic abstraction contracts and type implementation blocks.
- **Full Tooling Suite**: Interactive REPL (`zyra repl`), test runner (`zyra test`), coverage inspector (`zyra coverage`), hot-reloading dev server (`zyra watch`), security auditor (`zyra audit`), linter (`zyra fmt`), and LSP server (`zyra lsp`).

---

## Quickstart

Install Zyra on Windows in one click or on Linux via curl:

=== "Windows"

    Run **ZyraSetup.exe** standalone installer:

    ```powershell
    .\ZyraSetup.exe
    ```

=== "Linux / macOS"

    Install via curl command:

    ```bash
    curl -fsSL https://zyra-lang.dev/get.sh | bash
    ```

---

## Zyra Example

```zyra
trait Printable {
  def to_string(): String
}

struct User {
  id: Int
  name: String
}

impl Printable for User {
  def to_string(): String {
    return "User({self.name})"
  }
}

async def fetch_user(id: Int): Result[User, String] {
  if (id <= 0) {
    return Err("Invalid user ID")
  }
  return Ok(User { id: id, name: "Andrea" })
}

async def main(): Result[Int, String] {
  const user = await fetch_user(1)?
  print("Fetched user: {user.to_string()}")
  return Ok(0)
}
```

Run your code:
```bash
zyra run src/main.zy
```
