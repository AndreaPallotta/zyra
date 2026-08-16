# Standard Library Overview

The **Zyra Standard Library** provides zero-overhead, cross-platform primitives for common programming tasks across Native Rust and JavaScript ESM compilation targets.

---

## Zero-Import Dot-Notation Namespacing

Starting in **Zyra v2.2.0**, all standard library modules support **zero-import dot-notation namespacing**. You can invoke standard functions directly using `module.verb()` syntax without writing explicit `import` headers.

```zyra
def main(): Int {
  // Access environment, paths, math, strings, process, I/O, crypto, and networking without imports
  const port = env.get("PORT")
  const full_path = path.join("dist", "main.rs")
  const root = math.sqrt(16.0)
  const lower = str.lower("ZYRA")
  const data = io.read("config.json")
  const hash = crypto.sha256(data)

  print("Port: {port} | Path: {full_path} | SHA-256: {hash}")
  return 0
}
```

---

## Subpackages Index

| Subpackage | Namespace | Description |
| :--- | :--- | :--- |
| [**Environment**](env.md) | `env` | Environment variable getter/setter, CLI args, and `zyra.env` parser |
| [**Path Resolution**](path.md) | `path` | Cross-platform path joins, extensions, and directory resolution |
| [**Math and Random**](math.md) | `math`, `random` | Square roots, absolute values, rounding, and pseudo-random numbers |
| [**String Utilities**](str.md) | `str` | Substring splitting, case conversions, and pattern replacements |
| [**Process Management**](process.md) | `process` | Shell command execution and process termination controls |
| [**File I/O and Watcher**](io.md) | `io` | Multi-format file reader/writer and non-callback async file watcher |
| [**Cryptography**](crypto.md) | `crypto` | SHA-256/MD5 digests and Base64 character encoding/decoding |
| [**Networking and HTTP**](http.md) | `http` | Asynchronous REST client requests and embedded HTTP web server |

---

## Design Principles

1. **Target Parity**: Every standard library primitive is implemented natively on Rust compilation targets and natively on JavaScript ESM compilation targets.
2. **Zero Boilerplate**: No header imports or complex configuration required for basic tasks.
3. **Safety and Integrity**: Platform security and path sanity checks built in.
