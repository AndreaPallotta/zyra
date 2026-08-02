# Standard Library & Package Manager

Zyra includes built-in primitives for string manipulation, file system I/O, and seamless **Rust Crate Interop** via the `zyra add` package manager.

---

## Package Manager (`zyra add`)

Zyra v1.1 introduces native package management, allowing you to import any of the 150,000+ packages on `crates.io` directly into your Zyra application:

```bash
# Add Rust crate dependency to your project manifest (zyra.json)
zyra add reqwest
zyra add serde_json
```

### Rust Crate Interop Syntax

Use the `import rust "<crate>"` syntax to bring Rust crates into Zyra scope:

```zyra
import rust "reqwest" as http
import rust "serde_json" as json

def fetch_user_data(user_id: Int) {
  const url = "https://api.github.com/users/{user_id}"
  const res = http::get(url)
  print("Response payload: {res}")
}
```

---

## Built-in Modules

### `std::http`

High-level HTTP networking client powered by `reqwest`:

```zyra
import rust "reqwest" as http

def main() {
  const data = http::get("https://zyra-lang.dev")
  print("Documentation page fetched!")
}
```

### `std::json`

JSON parsing and serialization powered by `serde_json`:

```zyra
import rust "serde_json" as json

def main() {
  const parsed = json::parse("{\"name\": \"Zyra\"}")
  print(parsed)
}
```

---

## String Functions

### `len(s: String): Int`
Returns string length:
```zyra
const length = len("hello world") // 11
```

### `substr(s: String, start: Int, len: Int): String`
Extracts a substring:
```zyra
const sub = substr("zyra language", 0, 4) // "zyra"
```

### `trim(s: String): String`
Trims whitespace:
```zyra
const clean = trim("  zyra  ") // "zyra"
```

### `contains(s: String, sub: String): Bool`
Substring search:
```zyra
const is_found = contains("zyra lang", "zyra") // true
```

---

## File System I/O

### `file_read(path: String): String`
Reads entire file text:
```zyra
const content = file_read("config.txt")
```

### `file_write(path: String, content: String): Bool`
Writes text to file:
```zyra
const success = file_write("output.txt", "Zyra compiled content")
```
