# Zyra Standard Library (API Reference)

Welcome to the **Zyra v2.0 Standard Library API Documentation**. This reference is organized by modules, detailing method signatures, parameter types, return values, exception behavior, and interactive usage examples.

---

## Core Modules Index

| Module | Description | Stability |
| :--- | :--- | :--- |
| [`std::http`](#stdhttp) | Non-blocking REST client & web request handling | **Stable** |
| [`std::math`](#stdmath) | High-precision mathematical functions & RNG | **Stable** |
| [`std::time`](#stdtime) | System clocks, precision timestamps & sleep timers | **Stable** |
| [`std::process`](#stdprocess) | System process management, CLI args & env vars | **Stable** |
| [`std::regex`](#stdregex) | PCRE regular expression pattern matching | **Stable** |

---

## `std::http`

Networking primitives for making HTTP/HTTPS requests.

### `http::get(url: String): Result[String, String]`
Executes an asynchronous HTTP GET request to the target `url`.

- **Parameters**: `url` — Absolute target endpoint URL.
- **Returns**: `Result[String, String]` containing response payload on success (`Ok`), or error details (`Err`).

```zyra
import std::http

async def main(): Result[Int, String] {
  const payload = await http::get("https://api.github.com/users/AndreaPallotta")?
  print("Response: {payload}")
  return Ok(0)
}
```

---

## `std::math`

Mathematical constants, trigonometric routines, and random number generation.

### Methods Signature Table

| Method | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `math::sqrt(n: Float)` | `n: Float` | `Float` | Returns square root of `n`. |
| `math::pow(base: Float, exp: Float)` | `base: Float`, `exp: Float` | `Float` | Raises `base` to `exp` power. |
| `math::abs(n: Int)` | `n: Int` | `Int` | Absolute value of integer `n`. |
| `math::random()` | *None* | `Float` | Random float in range `[0.0, 1.0)`. |
| `math::sin(rad: Float)` | `rad: Float` | `Float` | Sine of angle `rad` in radians. |
| `math::cos(rad: Float)` | `rad: Float` | `Float` | Cosine of angle `rad` in radians. |

```zyra
import std::math

def main(): Int {
  const root = math::sqrt(144.0) // 12.0
  const rand_val = math::random()
  print("Sqrt: {root} | Random: {rand_val}")
  return 0
}
```

---

## `std::time`

Timekeeping, duration measurement, and thread sleeping.

### `time::now(): Int`
Returns high-resolution UNIX timestamp in milliseconds.

### `time::sleep_ms(duration_ms: Int): Void`
Suspends execution for `duration_ms` milliseconds.

```zyra
import std::time

def main(): Int {
  const start = time::now()
  time::sleep_ms(100)
  const elapsed = time::now() - start
  print("Elapsed time: {elapsed} ms")
  return 0
}
```

---

## `std::process`

Command-line argument parsing, environment variable retrieval, and process termination.

### `process::args(): Vector[String]`
Returns command-line invocation arguments.

### `process::env_var(key: String): Option[String]`
Looks up environment variable `key`.

### `process::exit(code: Int): Void`
Terminates current process immediately with status `code`.

```zyra
import std::process

def main(): Int {
  match process::env_var("PORT") {
    Some(port) => print("Server listening on port {port}")
    None => print("PORT env var not set, using default 8080")
  }
  return 0
}
```

---

## `std::regex`

Regular expression string pattern matching.

### `regex::is_match(pattern: String, text: String): Boolean`
Returns `true` if `text` matches regex `pattern`.

```zyra
import std::regex

def validate_email(email: String): Boolean {
  return regex::is_match("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$", email)
}
```
