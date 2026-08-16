# Functions, Asynchronous Execution, and Module Imports

Functions and modules form the structural foundation of Zyra applications, supporting clean function declarations, asynchronous execution, local module links, Go-style Git packages, and direct Cargo crate integration.

---

## Function Declarations

Functions in Zyra are defined using the `def` keyword. Parameters and return types can be explicitly annotated.

### Basic Functions
```zyra
def calculate_area(width: Int, height: Int): Int {
  const area = width * height
  return area
}

def greet(name: String): Void {
  print("Hello, {name}")
}
```

### Implicit and Explicit Return Values
The last expression in a function block can serve as an implicit return value, or explicit `return` statements can be used for early exits:

```zyra
def max(a: Int, b: Int): Int {
  if (a > b) {
    return a
  }
  return b
}
```

---

## Asynchronous Functions (`async def` and `await`)

Zyra supports asynchronous execution using non-blocking event loops on JavaScript targets and multi-threaded worker pools on Native Rust targets.

### Declaring Async Functions
Declare asynchronous routines using `async def`. An async function returns a `Result[T, E]` or promise payload:

```zyra
async def fetch_remote_data(url: String): Result[String, String] {
  if (len(url) == 0) {
    return Err("URL cannot be empty")
  }
  const payload = http.get(url)
  return Ok(payload)
}
```

### Awaiting Promises (`await`)
Use `await` to pause execution until an asynchronous task resolves:

```zyra
async def main(): Result[Int, String] {
  const data = await fetch_remote_data("https://api.github.com")?
  print("Received data length: {len(data)}")
  return Ok(0)
}
```

---

## Module Import System

Zyra features a hybrid module system that combines relative local file imports, Go-style Git package management, and direct Rust Cargo crate bridging.

### 1. Relative Local Directory Imports
Link local Zyra source files across directories using relative file paths:

```zyra
import "./utils/helpers.zy"
import "../models/user.zy"

def main(): Int {
  const user = create_user("Andrea")
  print(format_user(user))
  return 0
}
```

### 2. Go-Style Zyra Package Imports
Install and import remote Git packages declared in `zyra.json` dependencies:

```zyra
import "github.com/zyra-lang/sample-lib"

def main(): Int {
  const result = sample_lib.helper_function()
  print("Package output: {result}")
  return 0
}
```

Package dependencies are declared in `zyra.json` and tracked in `zyra.lock` with SHA-256 integrity checksums:

```json
{
  "name": "my-zyra-app",
  "version": "1.0.0",
  "dependencies": {
    "github.com/zyra-lang/sample-lib": "v1.0.0"
  }
}
```

### 3. Cargo Crate Ecosystem Bridging
Import any crate directly from `crates.io` without writing wrapper bindings:

```zyra
import rust "reqwest@0.12"
import rust "serde_json@1.0"

def main(): Int {
  print("Cargo crate dependencies linked successfully")
  return 0
}
```

### 4. Inline Rust Block Integration (`rust { ... }`)
For high-performance low-level routines, embed native Rust code blocks directly inside Zyra functions:

```zyra
def compute_fast_hash(input: String): String {
  rust {
    let bytes = input.as_bytes();
    let hash = bytes.iter().fold(0u64, |acc, &b| acc.wrapping_add(b as u64));
    return format!("{:x}", hash);
  }
}
```
