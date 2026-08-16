# Variables, Immutability, and Data Types

Zyra is a statically-typed language with strong local type inference. It offers static type safety while keeping syntax clean and uncluttered.

---

## Variable Declarations

Zyra distinguishes between immutable and mutable variable bindings at compile time.

### Immutable Bindings (`const`)
By default, variables defined with `const` cannot be reassigned or mutated after initialization. Attempting to reassign an immutable binding results in a compilation error.

```zyra
const port = 8080
const hostname = "localhost"
const max_retries = 5
```

### Mutable Bindings (`var`)
When a variable requires state modification over time, declare it using the `var` keyword.

```zyra
var current_attempts = 0
current_attempts = current_attempts + 1

var buffer = "initial data"
buffer = "updated data"
```

---

## Type Inference and Annotations

Zyra automatically infers variable types based on initial values. Explicit type annotations are optional for variables, but recommended for public APIs and complex interfaces.

```zyra
// Inferred types
const timeout = 30           // Inferred as Int
const speed = 99.85          // Inferred as Float
const is_active = true       // Inferred as Bool
const title = "Zyra Engine"  // Inferred as String

// Explicit type annotations
const count: Int = 100
const ratio: Float = 1.618
const flag: Bool = false
const name: String = "Andrea"
```

---

## Primitive Data Types

Zyra provides core scalar primitive types that map directly to native machine representation on Rust targets and JS primitive types on JavaScript targets.

| Primitive Type | Representation | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `Int` | 64-bit signed integer | `0` | Signed integer values ranging from `-9,223,372,036,854,775,808` to `9,223,372,036,854,775,807`. |
| `Float` | 64-bit IEEE 754 float | `0.0` | Double-precision floating-point numbers. |
| `Bool` | Boolean flag | `false` | Truth values representing `true` or `false`. |
| `String` | UTF-8 text string | `""` | Immutable UTF-8 text sequences. |
| `Void` | Unit type | *None* | Indicates the absence of a return value from a function. |

---

## String Interpolation and Built-in String Methods

Strings in Zyra support embedded variable interpolation and namespacing method calls.

### Interpolation
Variables can be embedded inside double-quoted strings using `{variable_name}` syntax:

```zyra
const user = "Andrea"
const score = 95
const message = "Player {user} scored {score} points"
print(message)
```

### String Methods
Strings provide zero-overhead utility methods:

```zyra
const text = "  Zyra Compiler  "

// Length inspection
const length = text.len()

// Trimming whitespace
const clean = text.trim()

// Substring check
if (clean.contains("Compiler")) {
  print("Found matching substring")
}
```

---

## Collections and Vectors (`Vector[T]`)

Zyra provides `Vector[T]` for ordered sequences of homogeneous elements.

```zyra
const numbers = [10, 20, 30, 40, 50]
const first = numbers[0]
const size = len(numbers)

print("Vector length: {size}")
```
