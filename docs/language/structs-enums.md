# Structs, Enums, and Algebraic Data Types

Zyra provides algebraic data types through `struct` product types and tagged `enum` sum types, offering structured data modeling and static type safety.

---

## Struct Declarations and Instantiation

A `struct` groups related named fields into a single record type.

### Declaring a Struct
```zyra
struct Account {
  id: Int
  email: String
  balance: Float
  is_verified: Bool
}
```

### Instantiating a Struct
Instantiate a struct using field key-value pairs inside curly braces:

```zyra
const account = Account {
  id: 1001,
  email: "developer@zyra-lang.dev",
  balance: 250.75,
  is_verified: true
}

print("Account ID: {account.id}")
print("Email: {account.email}")
print("Balance: {account.balance}")
```

### Implementing Struct Methods (`impl`)
Functions associated with a struct are declared inside an `impl` block. Use `self` to reference the instance:

```zyra
impl Account {
  def display_summary(): String {
    return "Account #{self.id} ({self.email}) Balance: ${self.balance}"
  }

  def is_active(): Bool {
    return self.is_verified && self.balance > 0.0
  }
}

def main(): Int {
  const acc = Account { id: 42, email: "user@domain.com", balance: 120.0, is_verified: true }
  print(acc.display_summary())
  return 0
}
```

---

## Enumerations (`enum`)

An `enum` defines a type that can hold one of several distinct variants. Variants can be plain labels or carry tuple payload data.

### Declaring Enums
```zyra
enum ConnectionState {
  Disconnected
  Connecting
  Connected(session_id: String)
  Failed(error_code: Int)
}
```

### Pattern Matching Enum Variants
Use `match` to inspect and destructure enum variants:

```zyra
def handle_state(state: ConnectionState): String {
  const status_text = match (state) {
    Connected(session) => "Online with session: {session}"
    Connecting => "Establishing connection"
    Disconnected => "Offline"
    Failed(code) => "Connection failed with error code {code}"
  }
  return status_text
}
```

---

## Standard Algebraic Types: `Option[T]` and `Result[T, E]`

Zyra includes standard algebraic container types built directly into the language syntax to eliminate null pointer exceptions.

### `Option[T]`
`Option[T]` represents a value that may or may not be present:
- `Some(value)`: Contains value of type `T`.
- `None`: Indicates absence of value.

```zyra
def find_user_by_id(id: Int): Option[String] {
  if (id == 1) {
    return Some("Andrea")
  }
  return None
}

def main(): Int {
  match (find_user_by_id(1)) {
    Some(name) => print("Found user: {name}")
    None => print("User not found")
  }
  return 0
}
```

### `Result[T, E]`
`Result[T, E]` represents the outcome of an operation that can succeed (`Ok`) or fail (`Err`):
- `Ok(T)`: Operation succeeded with value `T`.
- `Err(E)`: Operation failed with error `E`.

```zyra
def divide(a: Float, b: Float): Result[Float, String] {
  if (b == 0.0) {
    return Err("Division by zero error")
  }
  return Ok(a / b)
}

def main(): Int {
  match (divide(10.0, 2.0)) {
    Ok(val) => print("Result: {val}")
    Err(err) => print("Error: {err}")
  }
  return 0
}
```
