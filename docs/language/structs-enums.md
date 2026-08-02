# Structs & Enums

Zyra features robust algebraic data types including `struct` product types and tagged `enum` sum types with pattern matching.

---

## Struct Declarations

Declare custom record types with `struct`:

```zyra
struct User {
  id: Int
  name: String
  is_admin: Bool
}
```

### Instantiation & Access

```zyra
const u = User { id: 101, name: "Alice", is_admin: true }
print("User ID: {u.id}, Name: {u.name}")
```

---

## Enum Declarations

Enums represent data variants with optional payloads:

```zyra
enum Status {
  Active(user: String)
  Pending
  Inactive
}
```

### Pattern Matching (`match`)

Deconstruct enum variants cleanly using `match` expressions:

```zyra
def inspect_status(s: Status): String {
  const result = match (s) {
    Active(user) => "User {user} is online"
    Pending => "Pending verification"
    Inactive => "User is offline"
  }
  return result
}
```
