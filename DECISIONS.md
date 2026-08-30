# Architectural Decisions & Agent Context Handoffs

> Shared state and decision records for human developers and AI agents.

---

## 1. Architectural Decisions (ADR)

### ADR-001: Zero-Dependency `time.*` and `crypto.*` Standard Library Expansion
- **Date**: 2026-08-29
- **Status**: Accepted
- **Context**: Zyra developers required standard utilities for high-precision time measurement, thread sleeping, RFC 4122 UUIDv4 generation, HMAC-SHA256 signatures, and RFC 7519 JSON Web Tokens without pulling in heavy external dependencies.
- **Decision**: Implemented `time.*` (`now`, `unix`, `unix_ms`, `format`, `sleep`, `elapsed`) and extended `crypto.*` (`uuid`, `hmac_sha256`, `jwt_encode`, `jwt_decode`) natively in the zero-dependency compilation preamble for both Native Rust (`std::time`, pure arithmetic formatting, platform HMAC) and JavaScript ESM (`Date`, `Atomics.wait`, `node:crypto`).
- **Consequences**: Zero external crate/npm dependencies needed for production token authentication and timing.

---

## 2. Agent Session Handoffs

### Handoff: 2026-08-29 (v2.4.0 Phase 1)
- **Goal**: Implement `time.*` module and `crypto.*` primitives (UUID, HMAC, JWT) across Native Rust and JS targets.
- **Work Completed**:
  - `core/bin/zyra.rs`: Updated compiler substitutions and preambles for `time.*` and `crypto.*`.
  - `core/tests/test_v240_suite.zy`: Added unit test suite covering all new methods (3/3 passing).
  - All 15 test suites verified and passing.
  - Docs created (`docs/language/stdlib/time.md`) and updated (`docs/language/stdlib/crypto.md`, `index.md`, `mkdocs.yml`, `CHANGELOG.md`).
- **Next Immediate Action**: Implement postfix `?` error propagation operator on `Result[T, E]` and `Option[T]`, followed by `.unwrap()`, `.unwrap_or()`, and `.expect()`.
