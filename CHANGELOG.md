# Changelog

All notable changes to the **Zyra Programming Language & Toolchain** will be documented in this file.

## [v2.3.0] - 2026-08-23

- [`74fc7e0`](https://github.com/AndreaPallotta/zyra/commit/74fc7e0): **Lightweight Concurrency & Channels (`chan` and `spawn`)**
  - Added native channel-based concurrency primitives: `chan.new()`, `chan.clone()`, `chan.send(c, val)`, `chan.recv(c)`, and `chan.try_recv(c)`.
  - Added thread execution worker dispatch: `spawn(|| { ... })` and `spawn(move || { ... })`.
  - Added full cross-target support across Native Rust (`std::sync::mpsc`, `Arc<Mutex<...>>`, `std::thread`) and JS ESM (`ZyraChannel` promise queue).
- [`245729b`](https://github.com/AndreaPallotta/zyra/commit/245729b): **Recursive Directory Walking & Wildcard Globbing (`io.walk`, `io.glob`)**
  - Added recursive filesystem traversal `io.walk(dir)` skipping dotfiles/node_modules/target.
  - Added wildcard globbing `io.glob(pattern)` with support for `*` and `**` recursive patterns.
  - Upgraded `len()` to polymorphically support strings, slices, arrays, and vectors (`Vec<T>`).
- [`7872899`](https://github.com/AndreaPallotta/zyra/commit/7872899): **Embedded Zero-Dependency Key-Value Database (`db.*`)**
  - Added disk-backed thread-safe embedded key-value storage engine: `db.open(path)`, `db.set(handle, k, v)`, `db.get(handle, k)`, `db.has(handle, k)`, `db.delete(handle, k)`, and `db.keys(handle)`.
  - Atomic thread-safe memory caching with synchronized persistent disk flushes across Native Rust and JS ESM.
- [`292d426`](https://github.com/AndreaPallotta/zyra/commit/292d426): **In-Place Self-Updating CLI (`zyra update`)**
  - Added `zyra update` and `zyra update --check` commands to query GitHub releases, verify platform binaries, and replace the executable in-place with semver comparison.
- [`3178d1b`](https://github.com/AndreaPallotta/zyra/commit/3178d1b): **Rich Compiler Diagnostics & Code Snippet Highlighting**
  - Upgraded compiler error diagnostics with multi-line context, styled gutter line numbers, exact token underline spans (`^^^^^`), and actionable `help: ...` suggestions.
- [`bb17b5d`](https://github.com/AndreaPallotta/zyra/commit/bb17b5d): **Dynamic JSON AST Engine & Serializer (`json.*`)**
  - Zero-dependency recursive descent JSON parser supporting dynamic ASTs, querying, mutation, file reading, and pretty printing: `json.parse(str|dict)`, `json.read(path)`, `json.get(val, path)`, `json.set(val, path, new_val)`, `json.has(val, key)`, `json.keys(val)`, `json.stringify(val)`, `json.pretty(val)`.
- [`a4ce6c6`](https://github.com/AndreaPallotta/zyra/commit/a4ce6c6): **Regular Expressions Engine (`regex.*`)**
  - Zero-import regex engine supporting matching, token extraction, global replacement, and pattern splitting: `regex.is_match(pat, text)`, `regex.find(pat, text)`, `regex.find_all(pat, text)`, `regex.replace(pat, text, repl)`, `regex.split(pat, text)`.
- [`92744d7`](https://github.com/AndreaPallotta/zyra/commit/92744d7): **High-Level Task & Worker Pool (`pool.*`)**
  - Thread worker pool concurrency abstraction on top of channels and threads: `pool.new(workers)`, `pool.submit(p, task_fn)`, `pool.map(p, items, mapper_fn)`, `pool.wait_all(p)`.
- [`2d29ef2`](https://github.com/AndreaPallotta/zyra/commit/2d29ef2): **Manifest Script Runner (`zyra run <script>`, `zyra start`)**
  - Added manifest-driven lifecycle script execution from `zyra.json` `"scripts"` section and `zyra start` command.
- [`3d70d36`](https://github.com/AndreaPallotta/zyra/commit/3d70d36): **Tree-Shaking JS ESM Bundle Minifier (`zyra build --minify`)**
  - Dead-preamble elimination and comment/whitespace stripping during JS ESM builds delivering 60-85% file size reductions.
- [`497f5b0`](https://github.com/AndreaPallotta/zyra/commit/497f5b0): **In-Memory Hash Map & Dictionary Engine (`map.*`)**
  - Added thread-safe in-memory key-value dictionary and hash map primitives: `map.new()`, `map.set(m, k, v)`, `map.get(m, k)`, `map.has(m, k)`, `map.delete(m, k)`, `map.keys(m)`, `map.values(m)`, `map.len(m)`, `map.clear(m)`.
- [`08f962f`](https://github.com/AndreaPallotta/zyra/commit/08f962f): **Vector & Collection Transformation Utilities (`vec.*`)**
  - Added array and collection functional processing suite: `vec.sort(list)`, `vec.reverse(list)`, `vec.unique(list)`, `vec.join(list, sep)`, `vec.contains(list, item)`, `vec.slice(list, start, end)`, `vec.filter(list, pred)`, `vec.map(list, mapper)`, `vec.find(list, pred)`.
- [`bb4b6ab`](https://github.com/AndreaPallotta/zyra/commit/bb4b6ab): **URL & Query Parameter Parser (`url.*`)**
  - Added comprehensive URL and query string engine: `url.parse(raw)`, `url.get(u, field)`, `url.get_param(u, key)`, `url.encode(str)`, `url.decode(str)`.
- [`7c27544`](https://github.com/AndreaPallotta/zyra/commit/7c27544): **Standard Logging Framework (`log.*`)**
  - Added multi-level logger supporting console, file, and dual output modes: `log.info(msg)`, `log.warn(msg)`, `log.error(msg)`, `log.debug(msg)`, `log.set_level(level)`, `log.set_output(target)`, `log.set_file(path)`.
- [`a3420f0`](https://github.com/AndreaPallotta/zyra/commit/a3420f0): **Advanced HTTP Request Client & Interceptor Pipeline (`http.request`, `http.intercept`)**
  - Added full HTTP client with custom header dictionaries and pre-flight interceptor middleware pipeline: `http.intercept(fn)`, `http.request(method, url, headers, body)`.
- [`1bd7c13`](https://github.com/AndreaPallotta/zyra/commit/1bd7c13): **Compiler & CLI Fixes (`ZyraExitCode`, Flag Ordering, Exit Propagation)**
  - Implemented `ZyraExitCode` trait for `()`, `i64`, `i32`, `Result<T, E>`, and `Option<T>` enabling flexible `def main()` return types.
  - Fixed CLI flag ordering in `zyra build` allowing flags (`--target js`, `--minify`) to precede file arguments.
  - Fixed exit code propagation in `zyra run` to relay child process statuses.
  - Fixed `zyra build` native target to verify `rustc` compilation success.
  - Added composite module hashing for accurate incremental compilation caches.
  - Cleaned up CLI handler banners and logs.
- [`f6dbbda`](https://github.com/AndreaPallotta/zyra/commit/f6dbbda): **Tooling & Runtime Parity (`zyra test`, `zyra pkg`, REPL stdlib)**
  - Injected full standard library preamble into `zyra repl` evaluations.
  - Implemented automated package dependency resolution in `zyra pkg` with Git clone and caching in `.zyra_modules`.
  - Implemented dynamic unit test discovery and timing harness in `zyra test` supporting isolated execution of individual `@test` and `test_*` functions.
- [`c0575e0`](https://github.com/AndreaPallotta/zyra/commit/c0575e0): **VS Code Extension Modernization**
  - Updated TextMate syntax highlighting grammar with all modern keywords (`def`, `async`, `trait`, `impl`, `spawn`, etc.), types (`ZyraMap`, `ZyraUrl`, `ZyraChannel`, `ZyraKvDb`, `ZyraWorkerPool`), and standard library namespaces.
  - Added comprehensive snippet library in `vscode/snippets/zyra.json` for all 17 stdlib modules and language constructs.
- [`7492285`](https://github.com/AndreaPallotta/zyra/commit/7492285): **Complete Standard Library Documentation**
  - Added dedicated documentation pages for `json.md`, `regex.md`, `pool.md`, `chan.md`, `db.md`, `map.md`, `vec.md`, `url.md`, `log.md`.
  - Updated `mkdocs.yml` navigation tree and `docs/language/stdlib/index.md`.
- [`5d05f2b`](https://github.com/AndreaPallotta/zyra/commit/5d05f2b): **Transitive Preamble Dependency Resolution in JS Minifier**
  - Added fixed-point dependency discovery to prevent tree-shaking functions called transitively within the standard library preamble.

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
