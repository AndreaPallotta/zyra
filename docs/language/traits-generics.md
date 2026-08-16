# Traits, Generics, and Error Propagation

Zyra implements zero-cost abstraction contracts through `trait` definitions, type implementation blocks (`impl`), generic type parameters, and ergonomic error propagation operators.

---

## Traits (`trait`)

A `trait` defines a set of method signatures that concrete types must fulfill to satisfy the contract.

### Defining a Trait
```zyra
trait Serializer {
  def serialize(): String
  def get_format_name(): String
}
```

### Implementing Traits (`impl for`)
To implement a trait for a specific struct, use the `impl TraitName for StructName` syntax:

```zyra
struct Document {
  id: Int
  title: String
  content: String
}

impl Serializer for Document {
  def serialize(): String {
    return "{\"id\": {self.id}, \"title\": \"{self.title}\"}"
  }

  def get_format_name(): String {
    return "JSON"
  }
}

def main(): Int {
  const doc = Document { id: 101, title: "Architecture", content: "Overview text" }
  print("Format: {doc.get_format_name()}")
  print("Serialized: {doc.serialize()}")
  return 0
}
```

---

## Generics and Type Parameters

Generics allow functions, structs, and enums to operate over multiple concrete types while enforcing compile-time type safety.

### Generic Container Types
Zyra provides built-in generic types for error handling and optional values:

- `Result[T, E]`: Contains success payload of type `T` or error payload of type `E`.
- `Option[T]`: Contains optional value of type `T`.
- `Vector[T]`: Homogeneous list of elements of type `T`.

### Generic Function Signatures
```zyra
def wrap_in_result(val: String): Result[String, String] {
  if (len(val) == 0) {
    return Err("Value cannot be empty")
  }
  return Ok(val)
}
```

---

## Error Propagation Operator (`?`)

The question mark operator (`?`) provides concise error propagation for functions returning `Result[T, E]` or `Option[T]`.

### How the `?` Operator Works
When placed after a call returning a `Result`:
- If the result is `Ok(value)`, the operator unwraps and evaluates directly to `value`.
- If the result is `Err(error)`, the operator returns the `Err` early from the surrounding function.

```zyra
def read_config_key(filename: String, key: String): Result[String, String] {
  const file_content = io.read(filename)
  if (len(file_content) == 0) {
    return Err("Configuration file is missing or empty")
  }
  const value = env.get(key)
  return Ok(value)
}

def initialize_application(): Result[Int, String] {
  // Errors propagate automatically if read_config_key fails
  const port_str = read_config_key("zyra.env", "server.port")?
  print("Application initialized on port {port_str}")
  return Ok(0)
}
```

---

## Summary of Type System Features

1. **Static Safety**: All types are verified during compilation to prevent runtime type errors.
2. **Zero-Cost Abstractions**: Traits compile down to direct function dispatch on Native Rust targets and clean JavaScript prototypes on ESM targets.
3. **No Null Pointers**: Missing values are safely wrapped in `Option[T]`.
4. **Explicit Error Handling**: Operations that may fail return `Result[T, E]` and propagate cleanly via `?`.
