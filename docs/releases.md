# Releases and Version History

Official release notes, version history, and commit logs for the Zyra Programming Language and Toolchain.

---

## Release Summary

| Version | Release Date | Target | Key Highlights | Status |
| :--- | :--- | :--- | :--- | :--- |
| **v2.2.0** | 2026-08-16 | Native, JS ESM | Zero-import dot-notation namespacing, structured `zyra.env` parser, non-callback file watcher, expanded standard library | **Current Stable** |
| **v2.1.1** | 2026-08-16 | Native, JS ESM | Multi-format I/O (`io`), native HTTP web primitives (`net`), platform crypto, system info, 28 compiler bug fixes | Supported |
| **v2.1.0** | 2026-08-09 | Native, JS ESM | Multi-module struct return types, JS parameter type stripping, VS Code extension enhancements | Supported |

---

## Version 2.2.0 (2026-08-16)

Commit: [`a85fad8`](https://github.com/AndreaPallotta/zyra/commit/a85fad8)

### Features and Improvements

#### Zero-Import Dot-Notation Namespacing
Standard library functions now support intuitive module dot-notation without requiring explicit `import` statements:

- **`env`**: `env.get()`, `env.set()`, `env.args()`, `env.load()`
- **`path`**: `path.join()`, `path.exists()`, `path.ext()`, `path.basename()`, `path.dirname()`
- **`math`**: `math.sqrt()`, `math.abs()`, `math.floor()`, `math.ceil()`
- **`random`**: `random.int()`, `random.float()`
- **`str`**: `str.split()`, `str.lower()`, `str.upper()`, `str.replace()`
- **`process`**: `process.exec()`, `process.exit()`
- **`io`**: `io.read()`, `io.write()`, `io.watch()`, `io.has_changed()`
- **`crypto`**: `crypto.sha256()`, `crypto.md5()`, `crypto.base64_encode()`, `crypto.base64_decode()`
- **`http`**: `http.get()`, `http.post()`, `http.listen()`

#### Structured `zyra.env` Configuration Parser
Introduced `env.load("zyra.env")` to parse nested YAML-style configuration files directly into hierarchical environment keys:

```yaml
server:
  port: 8080
  host: localhost
database:
  url: postgres://localhost:5432/zyra_db
```

Access values anywhere via `env.get("server.port")` or `env.get("database.url")`. Security scanning in `zyra audit` now alerts developers if a `zyra.env` file is untracked in `.gitignore`.

#### Non-Callback Async File Watcher
Added `io.watch(path)` and non-blocking `io.has_changed(watcher)` to provide event-loop friendly file monitoring without callback nesting:

```zyra
var watcher = io.watch("src/main.zy")
if (io.has_changed(watcher)) {
  print("File updated")
}
```

---

## Version 2.1.1 (2026-08-16)

Commits: [`e42f3c7`](https://github.com/AndreaPallotta/zyra/commit/e42f3c7), [`7811f72`](https://github.com/AndreaPallotta/zyra/commit/7811f72), [`3417688`](https://github.com/AndreaPallotta/zyra/commit/3417688)

### Features and Improvements

- **Native Multi-Format I/O (`io`)**: Added `file_read_auto()`, `file_read_json()`, `file_write_json()`, `file_read_yaml()`, `file_write_yaml()`, `file_read_toml()`, `file_write_toml()`, `file_read_csv()`, and `file_write_csv()`.
- **Native HTTP Web Primitives (`net`)**: Added `net_listen(addr, handler)`, `http_get(url)`, and `http_post(url, body)`.
- **Crypto and Encoding (`crypto`)**: Added `sha256()`, `md5()`, `base64_encode()`, and `base64_decode()`.
- **DateTime and Timers (`datetime`)**: Added `now()`, `timestamp_ms()`, `sleep_ms()`, and `date_format()`.
- **System Info (`sys`)**: Added `sys_os()`, `sys_arch()`, `sys_cpu_count()`, and `exec_cmd_status()`.
- **CLI Enhancements**: Introduced live hot-reloading watcher (`zyra watch`), source code formatter (`zyra fmt`), and detailed diagnostic pointers.

### Bug Fixes and Correctness
- Fixed `sha256()` to return real 64-character SHA-256 digests via platform crypto.
- Fixed `md5()` to return real MD5 digests.
- Removed hardcoded test bypass in `base64_decode()`.
- Replaced shell string interpolation in `http_get()` and `http_post()` with parameterized `Command::new` execution to prevent command injection.
- Resolved path traversal risk in `handle_add`.
- Fixed dead code elimination pass to accurately track function usage.
- Generic auto-borrow insertion for standard library parameters.
- Fixed `zyra test` to compile source code and report accurate test counts.
- Fixed `zyra bench` to measure real binary latency.

---

## Version 2.1.0 (2026-08-09)

Commit: [`c745102`](https://github.com/AndreaPallotta/zyra/commit/c745102)

### Features and Improvements
- Resolved multi-module struct return type parsing.
- Fixed JavaScript parameter type stripping in transpiler output.
- Updated VS Code extension to support new syntax highlights and code lens features.
- Updated Conda build recipes and release pipeline automation.
