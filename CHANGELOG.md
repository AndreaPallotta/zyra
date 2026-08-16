# Changelog

All notable changes to the **Zyra Programming Language & Toolchain** will be documented in this file.

---

## [v2.2.0] - 2026-08-16

- [`da1670a`](https://github.com/AndreaPallotta/zyra/commit/da1670a): Release Zyra v2.2.0 with zero-import dot-notation stdlib, manifest-driven package resolution, and structured env
- **Zero-Import Dot-Notation Namespacing**: Introduced intuitive dot-notation for standard library modules without requiring explicit `import` statements:
  - `env.get()`, `env.set()`, `env.args()`, `env.load()`
  - `path.join()`, `path.exists()`, `path.ext()`, `path.basename()`, `path.dirname()`
  - `math.sqrt()`, `math.abs()`, `math.floor()`, `math.ceil()`, `random.int()`, `random.float()`
  - `str.split()`, `str.lower()`, `str.upper()`, `str.replace()`
  - `process.exec()`, `process.exit()`
  - `io.read()`, `io.write()`, `io.watch()`, `io.has_changed()`
  - `crypto.sha256()`, `crypto.md5()`, `crypto.base64_encode()`, `crypto.base64_decode()`
  - `http.get()`, `http.post()`, `http.listen()`
- **Structured `zyra.env` Environment Configuration**:
  - `env.load("zyra.env")`: Native YAML-style nested env parser auto-populating environment key-values (e.g. `server.port`, `database.url`).
  - Added secret exposure scanner in `zyra audit` for un-ignored `zyra.env` files.
- **Non-Callback File Watcher Handle**:
  - Added `io.watch(path)` and non-blocking `io.has_changed(watcher)` to eliminate callback hell in file watching.
- **Expanded Standard Modules**:
  - Added `env`, `path`, `math`, `random`, `str`, `process`, and `io.watch` primitives across Native Rust and JS ESM targets.

---

## [v2.1.1] - 2026-08-16

- **Native Unified Multi-Format I/O (`io`)**: Added `file_read_auto()`, `file_read_json()`, `file_write_json()`, `file_read_yaml()`, `file_write_yaml()`, `file_read_toml()`, `file_write_toml()`, `file_read_csv()`, and `file_write_csv()` with auto-format extension parsing across Native Rust and JS ESM targets.
- **Native HTTP Web Primitives (`net`)**: Added `net_listen(addr, handler)`, `http_get(url)`, and `http_post(url, body)` supporting 3-line native web servers (`HttpRequest` -> `HttpResponse`).
- **Crypto & Encoding (`crypto`)**: Added `sha256()`, `md5()`, `base64_encode()`, and `base64_decode()` functions.
- **DateTime & Timers (`datetime`)**: Added `now()`, `timestamp_ms()`, `sleep_ms()`, and `date_format()`.
- **System Info (`sys`)**: Added `sys_os()`, `sys_arch()`, `sys_cpu_count()`, and `exec_cmd_status()`.
- **CLI QoL Enhancements**:
  - `zyra watch <file.zy>`: Live hot-reloading watcher for source code edits.
  - `zyra fmt <file.zy>`: Source code formatter for `.zy` files.
  - Enhanced error diagnostics with source line pointers (`^^^`).
- **Bug Fixes — Crypto & Stdlib Correctness**:
  - `sha256()` now produces real 64-character SHA-256 digests via platform crypto (was returning a 16-char SipHash).
  - `md5()` now produces real MD5 digests (was incorrectly returning string length in hex).
  - `base64_decode()` generic decoder fixed; removed hardcoded test bypass.
  - `json_stringify` / `json_parse` documented as limited on Rust target (no serde).
- **Bug Fixes — Security**:
  - `http_get()` / `http_post()` no longer interpolate into shell strings; uses `Command::new("curl").args(...)` to prevent command injection.
  - `handle_add` rejects package names containing `..` to prevent path traversal.
- **Bug Fixes — Compiler & Transpiler**:
  - Dead code elimination now uses a proper two-pass scan (definitions → references) instead of a single pass that always kept every function.
  - Auto-borrow insertion (`&`) for stdlib functions is now generic; works with any variable name instead of a hardcoded allowlist.
  - `if (cond)` parenthesis stripping no longer clobbers unrelated `) {` patterns mid-line.
  - Removed unreachable duplicate struct handling in the Rust code generator.
  - Fixed potential panic from double-unwrap on `rustc` exit status in `handle_run`.
- **Bug Fixes — Runtime & CLI Tools**:
  - `zyra test` now actually compiles the target file and reports real pass/fail results.
  - `zyra bench` now compiles and times the user's code instead of benchmarking `2 + 2`.
  - `zyra fmt` correctly handles braces inside string literals without corrupting indentation.
  - `zyra audit` now recursively scans subdirectories (was only scanning top-level `src/`).
  - `sys_cpu_count()` in JS target uses `os.cpus().length` instead of returning hardcoded `8`.
  - `sleep_ms()` in JS target uses `Atomics.wait` instead of a CPU-pegging busy loop.
  - HTTP server `net_listen` buffer increased from 1KB to 8KB; response now uses proper reason phrases per status code.
- **3rd Party Package Management & Import Resolution**:
  - Implemented manifest-driven (`zyra.json`) 3rd party package import resolution (`import "github.com/user/repo"`).
  - Multi-candidate resolution checks relative importing directory, `.zyra_modules/<pkg>/<version>/`, `.zyra_modules/<pkg>/latest/`, and entrypoint files (`mod.zy`, `lib.zy`, `main.zy`, `index.zy`).
- **Installer & Tooling Pipeline Fixes**:
  - Prevented duplicate PATH appends in `installer.rs` by checking if the User PATH already contains the Zyra binary directory.
  - Enabled dynamic VS Code extension version resolution in `build-packages.js` and `build-vsix.js` from `editors/vscode/package.json`.
---

## [v2.1.0] - 2026-08-09

- [`c745102`](https://github.com/AndreaPallotta/zyra/commit/c745102): Resolve multi-module struct return types, JS parameter type stripping, and add CI paths-ignore
- [`69b4be3`](https://github.com/AndreaPallotta/zyra/commit/69b4be3): Bump VS Code extension and Conda package recipe version numbers to 2.1.0
- [`a0bb50c`](https://github.com/AndreaPallotta/zyra/commit/a0bb50c): Fix release workflow asset filenames, remove emojis, and add manual changelog
- [`bb1970b`](https://github.com/AndreaPallotta/zyra/commit/bb1970b): Update documentation and website highlights for v2.1.0 release
- [`563fbf9`](https://github.com/AndreaPallotta/zyra/commit/563fbf9): Add JS ESM module transpiler, dot method syntax, and error propagation
- [`768fc48`](https://github.com/AndreaPallotta/zyra/commit/768fc48): Add polymorphic traits, struct implementation blocks, JSON stdlib, and live git downloader
- [`338a773`](https://github.com/AndreaPallotta/zyra/commit/338a773): Add multi-file module imports, inline rust blocks, system env/cmd stdlib, and dual package manager

---

## [v2.0.0] - 2026-08-04

- [`51a4ffa`](https://github.com/AndreaPallotta/zyra/commit/51a4ffa): Clean up documentation website branding and remove hardcoded version strings
- [`53f201b`](https://github.com/AndreaPallotta/zyra/commit/53f201b): Redesign interactive web playground layout and remove emojis
- [`bc21780`](https://github.com/AndreaPallotta/zyra/commit/bc21780): Add Linux build script linker arguments
- [`f3f7cb5`](https://github.com/AndreaPallotta/zyra/commit/f3f7cb5): Update Conda package build recipe to compile native Rust driver
- [`ff80430`](https://github.com/AndreaPallotta/zyra/commit/ff80430): Add SHA-256 checksum integrity verification to Conda package manifest
