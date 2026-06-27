# Zyra Language Specification (v0)

This document contains the detailed specification of the Zyra language, including its file structure, syntax rules, types, semantics, and design constraints.

---

# Philosophy

Zyra is:
- Strict but not academic
- Functional but not dogmatic
- Async-safe
- Struct-first
- Expression-oriented
- Browser-native
- Zero-runtime
- Opinionated

Zyra removes JavaScript’s footguns without fighting the web platform.

---

# 1. File Structure

- Source extension: `.zy`
- Compiles to: `.js` (ESM)
- Project root is defined by the Zyra config file.
- All imports use absolute root syntax: `@/`

Example:
```zyra
from @/utils/math import add
```

---

# 2. Formatting (zyra fmt)

Zyra enforces a single canonical format:
- 2 spaces indentation
- No tabs
- No semicolons in source
- Braces on same line
- Imports sorted alphabetically
- Struct literals multiline by default
- Pipelines vertically aligned
- No configurable style rules

---

# 3. Variables

- `const` → immutable binding
- `var` → mutable binding
- Struct fields are always immutable
- Unused variables are compile errors
- `_` is the only discard binding

Example:
```zyra
const x = 10
var y = 20
```

---

# 4. Types

- Built-in Types
  - `Int` → JS `number`
  - `BigInt` → JS `bigint`
  - `Bool` → JS `boolean`
  - `String` → JS `string`
  - `Any`
  - `Void`
  - `Never`
- Optional Type
  - Represents `T | null`.
  - `undefined` is not allowed in Zyra source.
```zyra
String?
```

---

# 5. Numeric Rules

- `123` → `Int`
- `123n` → `BigInt`
- Float literals are not allowed in v0
- Mixing `Int` and `BigInt` requires explicit conversion.

Integer division:
```zyra
5 // 2
```
Compiles to:
```javascript
Math.trunc(5 / 2)
```

---

# 6. Functions

- Functions return last expression implicitly
- `return` is allowed
- Functions containing `await` compile to async function

Example:
```zyra
def add(a: Int, b: Int) -> Int {
  a + b
}
```

---

# 7. Expression-Oriented Design

Everything returns a value:
- `if`
- `match`
- `try`
- Blocks `{}`

Example:
```zyra
const x =
  if (n > 0) { 1 }
  else { 0 }
```

---

# 8. Structs (Immutable)

```zyra
struct User {
  id: UserId
  name: String
  age: Int?
}
```

- Construction:
```zyra
const u = User {
  id: UserId("u1")
  name: "Andre"
  age: null
}
```

- Update via copy:
```zyra
const u2 = u {
  name: "Bob"
}
```

- Raw object literals are not allowed.

---

# 9. Enums

```zyra
enum Result<T, E> {
  Ok(value: T)
  Err(error: E)
}
```

- Pattern matching:
```zyra
match r {
  Ok(v) => v
  Err(e) => throw e
}
```

---

# 10. Pattern Matching

Supports:
- Enum destructuring
- Struct destructuring
- Nested patterns
- Wildcard `_`
- Literal matching
- Exhaustiveness is enforced for enums

Example:
```zyra
match value {
  User { name, .. } => name
  _ => "unknown"
}
```

---

# 11. Equality

- `==` compiles to `===`
- `!=` compiles to `!==`
- No loose equality exists

---

# 12. Type Checking (is)

`is` checks type identity, not equality.
- Supports:
  - Built-in types
  - Struct types
  - Enum types

Example:
```zyra
if (value is User) { ... }
```

---

# 13. Booleans

Operators:
- `&&`
- `||`
- `!`
- Operands must be Bool. No truthiness allowed.

---

# 14. Strings

Double quotes interpolate:
```zyra
"hello {name}"
```

Single quotes are raw:
```zyra
'hello {name}'
```

Multiline:
```zyra
"""
hello {name}
"""
```

---

# 15. Async Model

- `await` keyword
- Async inferred automatically
- Top-level await allowed
- Promise must be:
  - awaited
  - stored
  - or explicitly ignored with spawn

Safe await:
```zyra
const x: T? = await? fetchData()
```
Compiles to `.catch(() => null)`.

---

# 16. Defer

```zyra
defer cleanup()
```
Compiles to `try/finally`.

---

# 17. Imports

Absolute only:
```zyra
from @/module/test import myfunction
```
Relative imports are not allowed.

---

# 18. Strictness Rules

Compile errors for:
- Unused variables
- Unused imports
- Unused parameters
- Forgotten promises
- Missing match cases (enum)
- Missing struct fields in construction

---

# 19. Collections

- Mutable collections:
  - `Array<T>`
  - `Map<K, V>`
- Struct fields remain immutable.

---

# 20. No OOP

Zyra has:
- No classes
- No inheritance
- No `this`
- No prototype manipulation
- No decorators
- No runtime library

Zyra compiles directly to clean modern JavaScript.
