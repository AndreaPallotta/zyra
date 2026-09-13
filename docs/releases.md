# Releases and Version History

Official release notes, version history, and commit logs for the Zyra Programming Language and Toolchain.

---

## Release Summary

| Version | Release Date | Target | Key Highlights | Status |
| :--- | :--- | :--- | :--- | :--- |
| **v2.6.0** | 2026-09-13 | Native, JS ESM | ZYX declarative UI (`.zyx`), task nurseries (`task.*`), zero-copy buffers (`buf.*`), AES-GCM & PBKDF2 (`crypto.*`), declarative config (`config.*`), event bus (`bus.*`), schema validation (`schema.*`), snapshot testing (`test.snapshot`), binary codec (`bin.pack`/`unpack`), terminal UI prompts (`tui.*`), HTTP mock (`http.mock`), CSV/TSV (`csv.*`), SemVer 2.0 (`semver.*`), set algebra (`set.*`), diff & similarity (`diff.*`), UUIDv7 (`uuid.*`), hermetic pack (`zyra pack`), OpenAPI 3.1 (`zyra openapi`), VS Code DAP (`zyra dap`), fuzzing (`@fuzz`) | **Current Stable** |
| **v2.5.0** | 2026-09-05 | Native, JS ESM, WASM | Closures & lambda captures, default & named arguments, spread syntax, relational SQL (`sql.*`), memory-mapped files (`io.mmap`), background task queues & cron (`cron.*`, `queue.*`) | Supported |
| **v2.4.0** | 2026-08-30 | Native, JS ESM | Postfix `?` error operator, arbitrary expression interpolation `{expr}`, tuple destructuring & match guards, `time.*`, `crypto.uuid/jwt`, `ws.*`, `io.lines/append/pipe`, `math.clamp/lerp/dot/norm`, `zyra bench`, `zyra coverage` HTML | Supported |
| **v2.3.0** | 2026-08-23 | Native, JS ESM | Concurrency & channels, embedded KV db, JSON AST, regex, worker pool, manifest scripts, JS minifier, in-memory map, vector utilities, URL engine, logging, HTTP interceptor client | Supported |
| **v2.2.0** | 2026-08-16 | Native, JS ESM | Zero-import dot-notation namespacing, structured `zyra.env` parser, non-callback file watcher, expanded standard library | Supported |
| **v2.1.1** | 2026-08-16 | Native, JS ESM | Multi-format I/O (`io`), native HTTP web primitives (`net`), platform crypto, system info, 28 compiler bug fixes | Supported |
| **v2.1.0** | 2026-08-09 | Native, JS ESM | Multi-module struct return types, JS parameter type stripping, VS Code extension enhancements | Supported |

---

## Version 2.6.0 (2026-09-13)

### Key Features & Additions
- **First-Class ZYX Declarative UI System (`.zyx`)**:
  - Full JSX-style declarative markup syntax lowering across native and web build targets.
  - Dynamic attribute string interpolation (`<span class="badge badge-{variant}">`).
  - Arbitrary expression interpolation (`<span>Total: {items.len() * 2}</span>`).
  - Nested component hierarchies, self-closing tag handling, and zero-dependency static web builds.
- **Structured Concurrency & Task Nurseries (`task.*`)**:
  - Cooperative nurseries (`task.group()`), background nursery task spawning (`task.spawn`), collective synchronization (`task.wait_all`), and group cancellation tokens (`task.cancel`, `task.is_cancelled`).
  - Bounded task execution with timeout guards (`task.with_timeout(ms, || { ... })`).
- **Zero-Copy Memory Streams & Ring Buffers (`buf.*`)**:
  - Sized byte buffer allocation (`buf.new`), string transcoding (`buf.from_str`, `buf.to_str`), and buffer length queries (`buf.len`).
  - Zero-copy buffer slicing (`buf.slice`), offset writes (`buf.write`), and hex/base64 encoding (`buf.to_hex`, `buf.to_base64`).
  - High-throughput circular streaming ring buffers (`buf.ring`, `buf.ring_write`, `buf.ring_read`).
- **Native Cryptographic Cipher Suite & Password Hashing (`crypto.*`)**:
  - Authenticated symmetric AES-GCM stream encryption and decryption (`crypto.encrypt_aes_gcm`, `crypto.decrypt_aes_gcm`) with tamper-proof tag verification over arbitrary AAD.
  - PBKDF2/SHA256 password hashing (`crypto.hash_password`) and constant-time verification (`crypto.verify_password`).
- **Declarative Configuration Engine (`config.*`)**:
  - Multi-format configuration loader (`config.load`) for JSON, TOML/INI, and `.env` files.
  - Automatic environment variable overrides (`ZYRA_<KEY>`) with type coercion getters (`config.get`, `config.get_int`, `config.get_bool`).
- **Distributed Event Bus & Pub/Sub Engine (`bus.*`)**:
  - Thread-safe publish/subscribe broker with hierarchical wildcard topic patterns (`*` and `**`), subscription handles, history inspection, and lock-free callback dispatch.
- **Declarative Schema Validation Engine (`schema.*`)**:
  - Fluent object, string, and integer constraint validation (`schema.string`, `schema.int`, `schema.min`, `schema.max`, `schema.pattern`, `schema.required`, `schema.validate`, `schema.is_valid`, `schema.validate_json`).
- **Snapshot & Golden-File Testing (`test.snapshot` / `zyra test --update-snapshots`)**:
  - Persistent golden-file verification in `__snapshots__/` with CLI snapshot updating flag (`--update-snapshots` / `-u`).
- **Endian-Aware Binary Protocol Codec (`bin.pack` & `bin.unpack`)**:
  - Python struct-compatible format string codec (`>`, `<`, `B`, `b`, `H`, `h`, `I`, `i`, `Q`, `q`, `<N>s`) and dedicated endian numeric packers (`bin.pack_u16_be`, `bin.pack_u32_be`, etc.).
- **Interactive Terminal UI Prompts (`tui.prompt`, `tui.confirm`, `tui.select`)**:
  - Terminal interactive input prompts with automated non-interactive headless fallback for CI and test environments.
- **Hermetic Standalone Packaging (`zyra pack`)**:
  - Single-binary zero-dependency packaging embedding user code, components, and runtime into standalone native executables (`zyra pack <file> -o <bin>`).
- **OpenAPI 3.1 Specification Generator (`zyra openapi`)**:
  - Static route and schema extraction producing compliant OpenAPI 3.1.0 specifications with interactive Swagger UI preview server (`zyra openapi --serve`).
- **VS Code Debug Adapter Protocol Server (`zyra dap`)**:
  - Full DAP specification implementation over stdio supporting initialize, breakpoints, threads, stack traces, scopes, variables, stepping, and disconnect.
- **Generative Property-Based Fuzzing Engine (`zyra test --fuzz` / `@fuzz`)**:
  - Automated randomized boundary value stress testing and invariant verification in the test runner.
- **In-Memory Network Stubbing & Mocking (`http.mock`)**:
  - Zero-socket network interception for HTTP GET and POST requests (`http.mock(pattern, status, body)`), wildcard endpoint routing (`*` and `**`), call history auditing (`http.mock_history()`), and state teardown (`http.mock_reset()`).
- **RFC-4180 CSV & TSV Data Processing (`csv.*`)**:
  - Deterministic CSV parser (`csv.parse`) supporting quoted multi-line fields and escaped double quotes, tab-delimited parser (`csv.parse_tsv`), header-aware record extraction into maps (`csv.parse_with_headers`), and RFC-compliant serializer (`csv.stringify`).
- **Semantic Versioning Engine (`semver.*`)**:
  - SemVer 2.0.0 parser with prerelease and build metadata extraction (`semver.parse`), relative precedence comparator (`semver.compare`), range satisfaction evaluator (`semver.satisfies` with `^`, `~`, `>=`, `<=`, `>`, `<`, `=`), and release bumper (`semver.bump_major`, `semver.bump_minor`, `semver.bump_patch`).
- **Mathematical Set Data Structure & Algebra (`set.*`)**:
  - Thread-safe unique element set (`set.new`, `set.add`, `set.has`, `set.remove`, `set.len`, `set.to_vec`) with algebraic set operations: union (`set.union`), intersection (`set.intersection`), difference (`set.difference`), and subset testing (`set.is_subset`).
- **Unified Diff & Levenshtein Similarity (`diff.*`)**:
  - Unified diff line generator (`diff.lines`), Wagner-Fischer edit distance computation (`diff.levenshtein`), and normalized string similarity ratio 0.0 to 1.0 (`diff.similarity`).
- **RFC-9562 Timestamp-Ordered UUID Generation (`uuid.*`)**:
  - RFC-9562 UUIDv7 generator (`uuid.v7()`) with millisecond Unix epoch time prefix for lexicographical index ordering, random UUIDv4 (`uuid.v4()`), and canonical 36-character hyphenated format validation (`uuid.is_valid`).

---

## Version 2.5.0 (2026-09-05)

### Key Features & Scope
- **100% Core Language Syntax Completion & Freeze**: First-class closures (`|x| x * 2`), default & named parameters (`def fn(x: Int = 10)`), struct/array spread syntax (`{ ...state, a: 1 }`), and optional chaining (`user?.profile?.name`).
- **Compiler Subsystem Modularization**: Architectural refactoring of monolithic `core/bin/zyra.rs` into modular Rust crates (`src/lexer/`, `src/parser/`, `src/ast/`, `src/codegen/`, `src/preamble/`, `src/cli/`).
- **First-Class Asynchronous Syntax (`async` / `await`)**: Native asynchronous functions and expression awaits with automatic lowering to Native Rust futures and JavaScript ESM Promises.
- **VS Code Debug Adapter Protocol (DAP)**: Graphical breakpoint debugging, stepping (`F10`/`F11`), call stacks, and variable watches inside VS Code via `zyra dap`.
- **Monorepo Workspace Orchestrator (`zyra build --workspace`)**: Multi-package dependency graph resolution, cross-package package imports (`@org/pkg`), and parallel module compilation.
- **Foreign Function Interface (`ffi.*`)**: Dynamic library loading (`.dll`, `.so`, `.dylib`) and C-ABI native symbol invocation.
- **Relational SQL Database Engine (`sql.*`)**: Parameterized SQLite, PostgreSQL, and MySQL connection pooling and query execution: `sql.open`, `sql.exec`, and `sql.query`.
- **Zero-Copy Memory-Mapped Files (`io.mmap`)**: High-performance memory mapping for reading and slicing large binary datasets.
- **Endian-Aware Binary Serialization (`bin.pack`, `bin.unpack`)**: Structured binary packing and unpacking for custom binary network protocols.
- **Distributed Event Bus & Pub/Sub (`bus.*`)**: Thread-safe in-process and inter-worker publish/subscribe event engine with wildcard topic patterns.
- **Declarative Schema Validation (`schema.*`)**: Runtime object validation and type coercion engine with detailed error path tracking.
- **Declarative CLI Flag & Command Parser (`cli.*`)**: Built-in CLI parser with automated `--help` generation, typed flag coercion, subcommands, and shell completions.
- **Interactive Terminal UI Toolkit (`tui.*`)**: Terminal styling, ANSI formatting, spinners, progress bars, interactive select prompts, and multi-column tables.
- **In-Memory Background Job Scheduler (`cron.*`, `queue.*`)**: Threaded cron job scheduling with 5-field syntax and background worker task queues.
- **Multi-Target Cross-Compilation (`zyra build --cross`)**: Single-command cross-compilation targeting `linux-x64`, `linux-arm64`, `macos-arm64`, `windows-x64`, and `wasm32-wasi`.
- **Live-Reloading HTTP & WebSocket Dev Server (`zyra dev`)**: Instant incremental recompilation and hot-reloading development server for web services.
- **OpenAPI Specification Generator (`zyra openapi`)**: Automatic extraction of REST routes and struct schemas into OpenAPI 3.1 JSON/YAML definitions.
- **Generative Property-Based Testing (`zyra test --fuzz` / `@fuzz`)**: Built-in fuzz testing engine with automated boundary value matrices and invariant validation.
- **Snapshot & Golden File Testing (`test.snapshot`, `zyra test --update-snapshots`)**: Automated assertions against stored `.snap` golden files.
- **Programmatic HTTP Mock Server (`http.mock`)**: In-memory HTTP stubbing and mocking server for test isolation.
- **WebAssembly Browser DOM & Canvas Bindings (`wasm.*`)**: HTML5 Canvas and browser event standard library bindings for WebAssembly targets.
- **Secure Memory & Hardware Vault (`vault.*`, `crypto.secure_mem`)**: Zero-on-free memory buffers and encrypted secret management for sensitive keys.

---

## Version 2.4.0 (2026-08-30)

### Key Features & Additions
- **Postfix Error Operator (`?`) & Unwrap Helpers**: Postfix `?` error propagation on `Result[T, E]` and `Option[T]`, plus `.unwrap()`, `.unwrap_or()`, and `.expect()`.
- **Arbitrary Expression Interpolation**: Support for inline expressions inside `{...}` template strings across Native and JS targets.
- **Destructuring Pattern Matching & Match Guards**: Tuple destructuring with conditional `if` guard expressions.
- **High-Precision Time Module (`time.*`)**: `time.now()`, `time.unix()`, `time.unix_ms()`, `time.sleep(ms)`, `time.elapsed(start_ts)`, and `time.format(ts, fmt)`.
- **UUID, HMAC, and JWT Tokens (`crypto.*`)**: Cryptographic RFC 4122 `crypto.uuid()`, `crypto.hmac_sha256(key, msg)`, and RFC 7519 `crypto.jwt_encode`/`crypto.jwt_decode`.
- **Streaming & Line-by-Line File I/O (`io.*`)**: `io.lines(path)`, `io.append(path, data)`, and `io.pipe(src, dest)`.
- **Linear Algebra & Numeric Math (`math.*`)**: `math.dot(v1, v2)`, `math.norm(v)`, `math.clamp(x, min, max)`, `math.lerp(a, b, t)`, `math.min(a, b)`, `math.max(a, b)`.
- **In-Process Microbenchmark Harness (`zyra bench`)**: 1,000 iterations in-process microbenchmarking with operations/sec and nanosecond latency tables.
- **Interactive Visual Code Coverage (`zyra coverage`)**: Terminal metrics and interactive `dist/coverage.html` visual report generation.
- **Full-Duplex WebSockets (`ws.*`)**: Zero-dependency RFC 6455 WebSocket client primitives: `ws.connect`, `ws.send`, `ws.recv`, `ws.close`.

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
- [`5d05f2b`](https://github.com/AndreaPallotta/zyra/commit/5d05f2b): **Transitive Preamble Dependency Resolution in JS Minifier**
  - Added fixed-point dependency discovery to prevent tree-shaking functions called transitively within the standard library preamble.

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
