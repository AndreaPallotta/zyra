# Zyra Programming Language

**Zyra** is a fast, expressive, statically-typed compiled programming language designed to combine the performance, safety, and type system of **Rust** with the clean simplicity and developer velocity of **Go**.

![Zyra Code Showcase](https://raw.githubusercontent.com/AndreaPallotta/zyra/main/assets/zyra_512x512.png){ align=left width=150 }

!!! tip "100% Self-Hosted, WebAssembly & Multi-Target Compiler"
    Zyra features a **100% self-hosted compiler** written in pure Zyra. It targets **Native Executables**, **WebAssembly (`wasm32`)**, and **JavaScript ESM Modules**, backed by an interactive CLI suite (debugger, test runner, coverage, linter, dev server, and verified package manager).

---

## Key Features

- **Zero-Overhead Native & WASM Executables**: Compiles down to native binaries and standalone `.wasm` WebAssembly modules.
- **`Option[T]` & `Result[T, E]` Error Handling**: Safe error propagation using `Some(x)`, `None`, `Ok(x)`, `Err(e)`, and `expr?`.
- **Traits & Interfaces (`trait` & `impl`)**: Polymorphic abstraction contracts and type implementation blocks.
- **Async / Await Non-Blocking Concurrency**: Non-blocking asynchronous functions (`async def`) and task execution (`await`).
- **Generics & Monomorphization**: Parametric polymorphism (`struct Box[T]` and `def identity[T](val: T): T`).
- **Verified Package Manager & SHA256 Lockfile**: Supply-chain security with `zyra.lock` and zero-auth GitHub imports (`zyra add github.com/user/repo`).
- **Full Tooling Suite (17 Commands)**: Debugger (`zyra debug`), Test runner (`zyra test`), Code coverage (`zyra coverage`), Dev server (`zyra dev`), Benchmark suite (`zyra bench`), Linter (`zyra lint`), Security auditor (`zyra audit`), Formatter (`zyra fmt`), and LSP server (`zyra lsp`).

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
