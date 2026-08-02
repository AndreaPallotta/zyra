# Zyra Programming Language

**Zyra** is a fast, expressive, statically-typed compiled programming language designed to combine the performance and safety of **Rust** with the clean simplicity and developer velocity of **Go**.

![Zyra Code Showcase](https://raw.githubusercontent.com/AndreaPallotta/zyra/main/assets/zyra_512x512.png){ align=left width=150 }

!!! tip "100% Self-Hosted & Multi-Target"
    Zyra features a **100% self-hosted compiler** written in pure Zyra (`zyra.zy`, `lexer.zy`, `parser.zy`, `checker.zy`). It compiles down to both **native C/Rust binaries** and **JavaScript ESM modules**.

---

## Key Features

- ⚡ **Zero-Overhead Native Executables**: Compiles down to native machine code binaries via Rust toolchain.
- 📦 **Algebraic Data Types & Pattern Matching**: First-class `struct` data structures, tagged `enum` variants, and pattern matching `match` expressions.
- 💬 **First-Class String Interpolation**: Embed variables directly in string literals using `"Hello {name}"`.
- 🛠 **Official VS Code Extension**: High-quality syntax highlighting, autocompletion, hover tooltips, and interactive **`▶ Run`** Code Lens buttons.
- 🌐 **Dual Compilation Targets**: Targets both standalone native binaries (`.exe` / ELF) and Node.js / Browser JavaScript ESM modules.

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
    curl -fsSL https://zyra-lang.dev/get | bash
    ```

---

## Hello World Example

```zyra
struct User {
  id: Int
  name: String
}

def greet(u: User): String {
  const clean_name = trim(u.name)
  print("Welcome to Zyra, {clean_name}!")
  return clean_name
}

def main(): Int {
  const user = User { id: 1, name: "  Andrea  " }
  const _ = greet(user)
  return 0
}
```

Run your code natively:
```bash
zyra build main.zy --target rust --native
./main.exe
```
