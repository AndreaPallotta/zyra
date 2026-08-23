# JSON Parser & AST (`json`)

The `json` module provides zero-import parsing, path-based querying, manipulation, and serialization for structured JSON data across both Native Rust and JavaScript ESM targets.

---

## Functions

### `json.parse(raw: String) -> ZyraJson`
Parses a JSON string into a structured, queryable AST node.

```zyra
const raw = "{\"user\": {\"name\": \"Alice\", \"id\": 101}}"
const doc = json.parse(raw)
```

### `json.get(node: ZyraJson, path: String) -> String`
Extracts a field or nested value using dot-notation path traversing.

```zyra
const name = json.get(doc, "user.name")
print("User name: {name}") // Alice
```

### `json.set(node: ZyraJson, path: String, value: String) -> ZyraJson`
Inserts or updates a value at the specified key.

```zyra
json.set(doc, "user.role", "admin")
```

### `json.has(node: ZyraJson, key: String) -> Bool`
Checks if a top-level key exists in the JSON object.

```zyra
if (json.has(doc, "user")) {
  print("User object is present")
}
```

### `json.keys(node: ZyraJson) -> Vec[String]`
Returns a list of all top-level keys.

```zyra
const keys = json.keys(doc)
```

### `json.stringify(node: ZyraJson) -> String`
Serializes a JSON AST node back to a compact JSON string.

### `json.pretty(node: ZyraJson) -> String`
Serializes a JSON AST node with 2-space indentation.

---

## Example

```zyra
def main(): Int {
  const payload = "{\"service\": \"auth\", \"port\": 8080, \"active\": true}"
  const parsed = json.parse(payload)

  const svc = json.get(parsed, "service")
  const port = json.get(parsed, "port")
  print("Service {svc} is configured on port {port}")

  return 0
}
```
