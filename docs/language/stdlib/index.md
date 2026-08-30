# Standard Library Overview

The **Zyra Standard Library** provides zero-overhead, cross-platform primitives for common programming tasks across Native Rust and JavaScript ESM compilation targets.

---

## Zero-Import Dot-Notation Namespacing

Starting in **Zyra v2.2.0** and expanded in **v2.3.0**, all standard library modules support **zero-import dot-notation namespacing**. You can invoke standard functions directly using `module.verb()` syntax without writing explicit `import` headers.

```zyra
def main(): Int {
  // Access collections, JSON, regex, logging, HTTP, DB, concurrency, and I/O without imports
  const m = map.new()
  map.set(m, "Content-Type", "application/json")

  const payload = json.parse("{\"status\": \"ok\", \"count\": 42}")
  const count = json.get(payload, "count")

  const numbers = vec.sort([40, 10, 30, 20])
  log.info("Sorted vector: {vec.join(numbers, \", \")}")

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
| [**File I/O and Watcher**](io.md) | `io` | Multi-format file reader/writer, directory globbing, and file watcher |
| [**Time and Clock**](time.md) | `time` | ISO-8601 timestamps, epoch clocks, thread sleeping, duration measuring, and formatting |
| [**Cryptography**](crypto.md) | `crypto` | SHA-256/MD5 digests, Base64, UUIDv4, HMAC-SHA256, and JWT tokens |
| [**Networking and HTTP**](http.md) | `http` | HTTP client with interceptor pipeline and embedded HTTP server |
| [**JSON Parser & AST**](json.md) | `json` | Structured JSON parsing, path-based querying, and serialization |
| [**Regular Expressions**](regex.md) | `regex` | Pattern matching, substring capture, search-and-replace, and splitting |
| [**Worker & Task Pool**](pool.md) | `pool` | Multi-threaded task scheduling, parallel mapping, and synchronization |
| [**Concurrency & Channels**](chan.md) | `chan`, `spawn` | CSP-style message channels and thread spawning |
| [**Key-Value Store**](db.md) | `db` | Embedded persistent key-value store with atomic disk persistence |
| [**In-Memory Map**](map.md) | `map` | Thread-safe in-memory hash maps and dictionaries |
| [**Vector Utilities**](vec.md) | `vec` | Vector sorting, filtering, deduplication, reversing, and slicing |
| [**URL & Query Parser**](url.md) | `url` | URL component extraction and query parameter parsing |
| [**Logging Framework**](log.md) | `log` | Structured multi-level logging with console and file sinks |

---

## Design Principles

1. **Target Parity**: Every standard library primitive is implemented natively on Rust compilation targets and JavaScript ESM compilation targets.
2. **Zero Boilerplate**: No header imports or complex configuration required for common tasks.
3. **Safety and Integrity**: Platform security, memory safety, and thread safety built in.
