# Zyra Programming Language

**Zyra** is a fast, expressive, statically-typed compiled programming language designed to combine the performance, safety, and type system of **Rust** with the clean simplicity and developer velocity of **Go**.

![Zyra Code Showcase](https://raw.githubusercontent.com/AndreaPallotta/zyra/main/assets/zyra_512x512.png){ align=left width=150 }

!!! tip "Zyra Compiler Core and Toolchain"
    Zyra features a **100% self-hosted compiler core** written in pure Zyra. It targets **Native Standalone Binaries**, **WebAssembly (`wasm32`)**, and **JavaScript ESM Modules (`.mjs`)**.

---

## Key Features

- **First-Class Zy UI (ZYX Declarative UI)**: Build user interfaces and fullstack web applications natively using JSX-style declarative markup (`.zyx`), dynamic attribute interpolation, and nested component hierarchies.
- **Zero-Import Dot-Notation Namespacing**: Access standard library routines directly (`env.*`, `path.*`, `math.*`, `str.*`, `io.*`, `crypto.*`, `http.*`, `csv.*`, `semver.*`, `set.*`, `diff.*`, `uuid.*`, `bus.*`, `schema.*`) without explicit import headers.
- **In-Memory Network Mocking (`http.mock`)**: Zero-socket HTTP request stubbing with wildcard endpoint matching (`*`, `**`) and call history auditing for fast, hermetic unit tests.
- **Comprehensive Standard Library**: Built-in RFC-4180 CSV/TSV engine (`csv.*`), SemVer 2.0.0 parser and range evaluator (`semver.*`), mathematical set algebra (`set.*`), unified diff line generation and similarity ratio (`diff.*`), and timestamp-ordered UUIDv7 generation (`uuid.*`).
- **Distributed Event Bus & Schema Engine**: In-process thread-safe pub/sub broker (`bus.*`) with hierarchical wildcard topics and fluent declarative constraint validation (`schema.*`).
- **Structured Concurrency & Zero-Copy Streams**: Cooperative nurseries (`task.group()`), bounded task execution timeouts, and high-throughput streaming ring buffers (`buf.ring`).
- **Structured `zyra.env` Environment Configuration**: Parse hierarchical YAML-style configuration files (`server.port`, `database.url`) natively via `env.load("zyra.env")`.
- **Non-Callback Async File Watcher**: Monitor file system updates asynchronously (`io.watch()`, `io.has_changed()`) without callback nesting.
- **Zero-Overhead Native and JS ESM Executables**: Compiles down to native binaries via `rustc` and standalone `.mjs` JavaScript ESM modules.
- **Go-Style Package Resolution**: Install remote Git repositories (`zyra add github.com/user/repo`) with SHA-256 integrity lockfiles (`zyra.lock`).
- **Seamless Rust and Cargo Ecosystem Bridging**: Import any Cargo crate directly (`import rust "reqwest@0.12"`) or write inline `rust { ... }` blocks inside Zyra functions.
- **Full Tooling Suite**: Interactive REPL (`zyra repl`), test runner with snapshot testing and fuzzing (`zyra test`), standalone packager (`zyra pack`), OpenAPI 3.1 generator (`zyra openapi`), VS Code DAP server (`zyra dap`), and LSP server (`zyra lsp`).

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

---

## Zy UI Declarative Showcase (`.zyx`)

Build fullstack and web components directly in Zyra with declarative JSX-style markup:

```zyx
def user_card(name: String, role: String, badge: String): String {
  return (
    <div class="card p-4 rounded shadow-sm border border-secondary">
      <div class="d-flex justify-content-between align-items-center">
        <h3 class="card-title mb-1 text-primary">{name}</h3>
        <span class="badge bg-success">{badge}</span>
      </div>
      <p class="card-text text-muted">{role}</p>
      <div class="mt-3">
        <a class="btn btn-sm btn-outline-primary" href="/profile/{name}">View Profile</a>
      </div>
    </div>
  )
}

def main(): Int {
  const html = user_card("Andrea Pallotta", "Lead Systems Architect", "Verified")
  print(html)
  return 0
}
```

Learn more in the [**Zy UI Guide**](language/zyx-ui.md).

