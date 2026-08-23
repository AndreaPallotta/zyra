# Releases and Version History

Official release notes, version history, and commit logs for the Zyra Programming Language and Toolchain.

---

## Release Summary

| Version | Release Date | Target | Key Highlights | Status |
| :--- | :--- | :--- | :--- | :--- |
| **v2.3.0** | 2026-08-23 | Native, JS ESM | Concurrency & channels, embedded KV db, JSON AST, regex, worker pool, manifest scripts, JS minifier, in-memory map, vector utilities, URL engine, logging, HTTP interceptor client | **Current Stable** |
| **v2.2.0** | 2026-08-16 | Native, JS ESM | Zero-import dot-notation namespacing, structured `zyra.env` parser, non-callback file watcher, expanded standard library | Supported |
| **v2.1.1** | 2026-08-16 | Native, JS ESM | Multi-format I/O (`io`), native HTTP web primitives (`net`), platform crypto, system info, 28 compiler bug fixes | Supported |
| **v2.1.0** | 2026-08-09 | Native, JS ESM | Multi-module struct return types, JS parameter type stripping, VS Code extension enhancements | Supported |

---

## Version 2.3.0 (2026-08-23)

### Key Features and Commits
- [`74fc7e0`](https://github.com/AndreaPallotta/zyra/commit/74fc7e0): **Lightweight Concurrency & Channels (`chan` and `spawn`)**
  - Native thread-safe channel primitives: `chan.new()`, `chan.clone()`, `chan.send()`, `chan.recv()`, `chan.try_recv()`.
  - Worker thread spawning via `spawn(|| { ... })` and `spawn(move || { ... })`.
- [`245729b`](https://github.com/AndreaPallotta/zyra/commit/245729b): **Recursive Directory Walking & Wildcard Globbing (`io.walk`, `io.glob`)**
  - High-performance recursive directory walker and wildcard glob matcher supporting `*` and `**` patterns.
- [`7872899`](https://github.com/AndreaPallotta/zyra/commit/7872899): **Embedded Zero-Dependency Key-Value Database (`db.*`)**
  - Thread-safe disk-backed persistence engine: `db.open`, `db.set`, `db.get`, `db.has`, `db.delete`, and `db.keys`.
- [`292d426`](https://github.com/AndreaPallotta/zyra/commit/292d426): **In-Place Self-Updating CLI (`zyra update`)**
  - Automated release checking and in-place executable upgrading via `zyra update` and `zyra update --check`.
- [`3178d1b`](https://github.com/AndreaPallotta/zyra/commit/3178d1b): **Rich Compiler Diagnostics Engine**
  - Multi-line context rendering, column underline spans (`^^^^^`), and actionable auto-fix suggestions.
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

### Future Roadmap
- **VS Code Debugger Protocol (DAP)**: Implement Debug Adapter Protocol endpoints in VS Code extension for breakpoint debugging.
- **macOS Apple Silicon Installer**: Add standalone curl installer script for macOS ARM64 platform binaries.

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
