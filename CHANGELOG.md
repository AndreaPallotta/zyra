# Changelog

All notable changes to the **Zyra Programming Language & Toolchain** will be documented in this file.

## [v2.6.1] - 2026-09-20

### Declarative UI & Custom Component Lowering
- **First-Class ZYX Custom Component Invocations**:
  - UpperCamelCase tag invocation lowering: transforms `<Card title="Andrea" count={42} />` into functional component calls `Card("Andrea".to_string(), 42)`.
  - Component children slot passing: nested child elements lower into deterministic formatted markup strings and are passed as trailing arguments.
  - Full attribute expression and template string support across self-closing and paired component elements.
- **VS Code Extension & Tooling**:
  - TextMate grammar integration recognizing XML and HTML declarative markup (`.zyx`) in both standalone VSIX and LSP extension packages.
  - Scoped tokenization for opening tags, closing tags, self-closing elements, and tag identifiers (`entity.name.tag.zyra`).
  - Attribute key-value highlighting (`entity.other.attribute-name.zyra`), boolean valueless attributes, and quote-delimited values.
  - Dynamic string template interpolation inside attribute values (`<button class="btn btn-{variant}">`).
  - Embedded expression block highlighting (`={expr}`) and text node expression bindings (`{items.len()}`).
  - File association mappings for `.zyx` under `contributes.languages` with alias entries for Zyra UI and ZYX.
  - Official Zyra icon theme association for `.zyx` file extensions in file explorer trees.
  - Extended workspace file watchers monitoring both `.zy` and `.zyx` source files.
  - Dedicated code snippets for functional components (`zyxcomponent`), elements (`zyxelement`), and self-closing tags (`zyxselfclosing`).

### Security & Sanitization Standard Library (`html.*`)
- **Built-in HTML Sanitization & Entity Codec**:
  - `html.escape(s)`: Zero-allocation string entity encoding for `&`, `<`, `>`, `"`, and `'`.
  - `html.unescape(s)`: Fast entity decoding back to raw UTF-8 strings.
  - `html.strip_tags(s)`: Safe XML/HTML tag stripping preserving inner text content.

### In-Memory TTL Cache Engine (`cache.*`)
- **Thread-Safe Key-Value Expiration Cache**:
  - `cache.new(default_ttl_ms)`: Sized in-memory cache constructor with configurable default time-to-live.
  - `cache.set(c, key, val, ttl_ms)`: Key-value insertion with optional per-entry TTL override.
  - `cache.get(c, key)`: Instant lookup returning value or empty string on expiration.
  - `cache.has(c, key)`: Active validity check taking expiry timestamps into account.
  - `cache.delete(c, key)`: Explicit entry eviction.
  - `cache.prune(c)`: Active compaction removing all expired keys and returning total pruned count.
  - `cache.len(c)` and `cache.clear(c)`: Cache sizing and reset controls.

### Path Globbing Engine (`glob.*`)
- **Zero-Dependency Wildcard Matching & Discovery**:
  - `glob.match(pattern, path)`: Pure string wildcard pattern matcher with 2D DP algorithm supporting single-star (`*`), double-star recursive (`**`), and single-character wildcard (`?`).
  - `glob.find(pattern)`: Recursive filesystem directory walk returning sorted relative file paths matching the wildcard expression.

### Resilient Retry Engine (`retry.*`)
- **Fault-Tolerant Execution & Backoff**:
  - `retry.run(attempts, delay_ms, || { ... })`: Fixed-delay execution retry loop.
  - `retry.with_backoff(attempts, base_delay_ms, max_delay_ms, || { ... })`: Exponential backoff loop doubling retry delay up to configured maximum cap.

## [v2.6.0] - 2026-09-13

### Declarative UI & Front-End Systems
- **First-Class ZYX Declarative UI System (`.zyx`)**:
  - Native JSX-style declarative markup lowering for user interfaces and web applications.
  - Dynamic attribute string interpolation (`<span class="badge badge-{variant}">`).
  - Arbitrary expression interpolation (`<span>Total: {items.len() * 2}</span>`).
  - Nested component hierarchies, self-closing tag handling, and zero-dependency static web builds.

### Concurrency, Memory & Systems Runtime
- **Structured Concurrency & Task Nurseries (`task.*`)**:
  - Cooperative nurseries (`task.group()`), background nursery task spawning (`task.spawn`), collective synchronization (`task.wait_all`), and group cancellation tokens (`task.cancel`, `task.is_cancelled`).
  - Bounded task execution with timeout guards (`task.with_timeout(ms, || { ... })`).
- **Zero-Copy Memory Streams & Ring Buffers (`buf.*`)**:
  - Sized byte buffer allocation (`buf.new`), string transcoding (`buf.from_str`, `buf.to_str`), and buffer length queries (`buf.len`).
  - Zero-copy buffer slicing (`buf.slice`), offset writes (`buf.write`), and hex/base64 encoding (`buf.to_hex`, `buf.to_base64`).
  - High-throughput circular streaming ring buffers (`buf.ring`, `buf.ring_write`, `buf.ring_read`).

### Cryptography & Configuration
- **Native Cryptographic Cipher Suite & Password Hashing (`crypto.*`)**:
  - Authenticated symmetric AES-GCM stream encryption and decryption (`crypto.encrypt_aes_gcm`, `crypto.decrypt_aes_gcm`) with tamper-proof tag verification over arbitrary AAD.
  - PBKDF2/SHA256 password hashing (`crypto.hash_password`) and constant-time verification (`crypto.verify_password`).
- **Declarative Configuration Engine (`config.*`)**:
  - Multi-format configuration loader (`config.load`) for JSON, TOML/INI, and `.env` files.
  - Automatic environment variable overrides (`ZYRA_<KEY>`) with type coercion getters (`config.get`, `config.get_int`, `config.get_bool`).

### Standalone Packaging & Toolchain
- **Hermetic Standalone Packaging (`zyra pack`)**:
  - Single-binary zero-dependency packaging embedding user code, components, and runtime into standalone native executables (`zyra pack <file> -o <bin>`).
- **OpenAPI 3.1 Specification Generator (`zyra openapi`)**:
  - Static route and schema extraction producing compliant OpenAPI 3.1.0 specifications with interactive Swagger UI preview server (`zyra openapi --serve`).
- **VS Code Debug Adapter Protocol Server (`zyra dap`)**:
  - Full DAP specification implementation over stdio supporting initialize, breakpoints, threads, stack traces, scopes, variables, stepping, and disconnect.
- **Generative Property-Based Fuzzing Engine (`zyra test --fuzz` / `@fuzz`)**:
  - Automated randomized boundary value stress testing and invariant verification in the test runner.
- **Snapshot & Golden-File Testing (`test.snapshot` / `zyra test --update-snapshots`)**:
  - Automated assertions against persistent `.snap` files in `__snapshots__/` with CLI `--update-snapshots` (`-u`) flag.

### Networking, Validation & Terminal Capabilities
- **Distributed Event Bus & Pub/Sub Engine (`bus.*`)**:
  - Thread-safe in-process and cross-worker event broker with hierarchical wildcard topic matching (`*` and `**`), bounded history tracking, subscription IDs, and lock-free callback dispatch.
- **Declarative Schema Validation Engine (`schema.*`)**:
  - Fluent object and primitive validation with constraints (`schema.string`, `schema.int`, `schema.min`, `schema.max`, `schema.pattern`, `schema.required`, `schema.validate`, `schema.is_valid`, `schema.validate_json`).
- **Endian-Aware Binary Protocol Codec (`bin.pack` & `bin.unpack`)**:
  - Format-string-based binary packing and unpacking (`>`, `<`, `B`, `b`, `H`, `h`, `I`, `i`, `Q`, `q`, `<N>s`) alongside dedicated endian numeric codecs (`bin.pack_u16_be`, `bin.pack_u32_be`, `bin.unpack_u16_be`, `bin.unpack_u32_be`, etc.).
- **Interactive Terminal UI Prompts (`tui.prompt`, `tui.confirm`, `tui.select`)**:
  - Full-featured interactive CLI prompts with automatic non-interactive headless fallback for test runners and CI/CD environments.

### Standard Library & Network Mocking Extensions
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

## [v2.5.0] - 2026-09-05

- **100% Core Language Syntax Completion & Freeze**:
  - **First-Class Closures & Environment Captures (`|args| expr`, `|args| { ... }`)**: Anonymous lambda expressions with lexical variable capture for callbacks, UI event loops, and array transforms.
  - **Default Parameter Values & Named Arguments (`def fn(a: Int, b: Int = 10)`)**: Default parameters in function declarations and named arguments at invocation sites (`fn(a = 1, b = 20)`).
  - **Struct & Array Spread Syntax (`...`)**: Immutable struct field cloning (`{ ...state, updated_field: val }`) and vector concatenation (`[...vec1, ...vec2]`).
  - **Optional Chaining Navigation (`?.`)**: Short-circuiting property and method navigation on nullable references and options (`user?.profile?.email`).
- **Compiler Subsystem Modularization**:
  - Refactor monolithic `core/bin/zyra.rs` into modular Rust subsystems (`core/src/lexer/`, `core/src/parser/`, `core/src/ast/`, `core/src/codegen/`, `core/src/preamble/`, `core/src/cli/`).
- **First-Class Asynchronous Syntax (`async` / `await`)**:
  - Native asynchronous functions (`async def`) and expression awaits (`await`) with automatic lowering to Native Rust futures and JavaScript ESM Promises.
- **VS Code Debug Adapter Protocol (DAP)**:
  - Implement DAP protocol server (`zyra dap`) over stdio to enable GUI breakpoint debugging, stepping (`F10`/`F11`), call stacks, and variable watch inspection in VS Code.
- **Monorepo Workspace Orchestrator (`zyra build --workspace`)**:
  - Support `"workspaces"` in `zyra.json` with topological dependency graph resolution, cross-package imports (`@org/pkg`), and parallel module compilation.
- **Foreign Function Interface (`ffi.*`)**:
  - Dynamic library loading (`.dll`, `.so`, `.dylib`) and C-ABI native symbol invocation without writing wrapper glue.
- **Relational SQL Database Engine (`sql.*`)**:
  - Add parameterized SQLite, PostgreSQL, and MySQL connection pooling and query execution: `sql.open`, `sql.exec`, and `sql.query`.
- **Zero-Copy Memory-Mapped Files (`io.mmap`)**:
  - High-performance memory mapping for reading and slicing large binary datasets directly from virtual memory.
- **Endian-Aware Binary Serialization (`bin.pack`, `bin.unpack`)**:
  - Structured binary packing and unpacking for custom binary network protocols and serialization formats.
- **Distributed Event Bus & Pub/Sub (`bus.*`)**:
  - Thread-safe in-process and inter-worker publish/subscribe event engine with wildcard topic patterns.
- **Declarative Schema Validation (`schema.*`)**:
  - Runtime object validation and type coercion engine with detailed error path tracking.
- **Declarative CLI Flag & Command Parser (`cli.*`)**:
  - Built-in command line argument parser with automated `--help` generation, typed flag coercion, subcommands, and shell completions.
- **Interactive Terminal UI Toolkit (`tui.*`)**:
  - Terminal styling, ANSI formatting, spinners, progress bars, interactive select prompts, and multi-column tables.
- **In-Memory Background Job Scheduler (`cron.*`, `queue.*`)**:
  - Threaded cron job scheduling with 5-field syntax and background worker task queues.
- **Multi-Target Cross-Compilation (`zyra build --cross`)**:
  - Single-command cross-compilation targeting `linux-x64`, `linux-arm64`, `macos-arm64`, `windows-x64`, and `wasm32-wasi`.
- **Live-Reloading HTTP & WebSocket Dev Server (`zyra dev`)**:
  - Instant incremental recompilation and hot-reloading development server for web services and APIs.
- **OpenAPI Specification Generator (`zyra openapi`)**:
  - Automatic extraction of REST routes and struct schemas into OpenAPI 3.1 JSON/YAML definitions.
- **Generative Property-Based Testing (`zyra test --fuzz` / `@fuzz`)**:
  - Built-in fuzz testing engine with automated boundary value matrices and invariant validation.
- **Snapshot & Golden File Testing (`test.snapshot`, `zyra test --update-snapshots`)**:
  - Automated assertions against stored `.snap` golden files.
- **Programmatic HTTP Mock Server (`http.mock`)**:
  - In-memory HTTP stubbing and mocking server for test isolation.
- **WebAssembly Browser DOM & Canvas Bindings (`wasm.*`)**:
  - Direct HTML5 Canvas and browser event standard library bindings for WebAssembly targets.
- **Secure Memory & Hardware Vault (`vault.*`, `crypto.secure_mem`)**:
  - Zero-on-free memory buffers and encrypted secret management for sensitive keys.

## [v2.4.0] - 2026-08-30

- **Postfix Error Propagation Operator (`?`)**:
  - Added native `?` try operator for automatic error bubbling on `Result[T, E]` and `Option[T]` expressions without nested match blocks.
  - Full support for bracketed generic return types (`Result[T, E]` -> `Result<T, E>`) and auto-converted error strings.
- **Full-Duplex WebSockets (`ws.*`)**:
  - Added zero-dependency WebSocket client module: `ws.connect(url)`, `ws.send(socket, msg)`, `ws.recv(socket)`, and `ws.close(socket)`.
  - Implemented RFC 6455 frame builder/parser over TCP in Native Rust and client abstraction in JavaScript ESM.
- **In-Process Microbenchmark Harness (`zyra bench`)**:
  - Automatically discovers `def bench_...()` routines and runs 1,000 iterations in-process with warmup.
  - Reports operations/second, mean latency, min/max runtime tables with nanosecond precision.
- **Interactive Visual Test Coverage Reporter (`zyra coverage`)**:
  - Analyzes function and line coverage, generating terminal metrics and an interactive `dist/coverage.html` visual report.
- **Streaming & Line-by-Line File I/O (`io.*`)**:
  - Added `io.lines(path)` for memory-efficient line reading.
  - Added `io.append(path, data)` for atomic file appends.
  - Added `io.pipe(src, dest)` for zero-copy file piping across Native Rust and JavaScript ESM targets.
- **Linear Algebra & Numeric Math Primitives (`math.*`)**:
  - Added vector operations: `math.dot(v1, v2)` and `math.norm(v)`.
  - Added interpolation and boundary helpers: `math.clamp(val, min, max)`, `math.lerp(a, b, t)`, `math.min(a, b)`, `math.max(a, b)`.
- **Arbitrary Expression String Interpolation**:
  - Full expression evaluation inside string interpolation templates `"{a + b * 2}"`, `"{str.upper(name)}"`, and nested function calls.
  - Multi-target support across Native Rust (`format!`) and JavaScript ESM (ES6 template literals `` `${expr}` ``).
- **Destructuring Pattern Matching & Match Guards**:
  - Structural pattern matching for tuples, scalar values, and algebraic data types (`Option`, `Result`) with conditional `if` guard expressions (`(x, y) if x == y => ...`).
  - Automatic statement block semicolon insertion for variable-assigned `match` expressions.
- **Ergonomic Unwrap & Option Primitives**:
  - Added `.unwrap()`, `.unwrap_or(default)`, and `.expect(msg)` helpers across Native Rust and JavaScript ESM runtime preambles.
- **High-Precision DateTime & Clock Module (`time.*`)**:
  - Added zero-import `time.*` standard library: `time.now()`, `time.unix()`, `time.unix_ms()`, `time.format(ts, fmt)`, `time.sleep(ms)`, and `time.elapsed(start_ts)`.
  - Zero-dependency implementation across Native Rust (`std::time`, `SystemTime`, `Duration`) and JavaScript ESM (`Date`, `Atomics.wait`).
- **Enhanced Cryptography & Token Primitives (`crypto.*`)**:
  - Added RFC 4122 v4 UUID generator (`crypto.uuid()`).
  - Added HMAC-SHA256 signature generator (`crypto.hmac_sha256(key, message)`).
  - Added RFC 7519 HS256 JSON Web Token encoder and decoder with signature verification (`crypto.jwt_encode(payload, secret)`, `crypto.jwt_decode(token, secret)`).

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
