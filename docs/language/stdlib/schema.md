# Declarative Schema Validation Subpackage (`schema`)

The `schema` module provides fluent declarative validation primitives for primitives, strings, numbers, and structured JSON payloads.

---

## API Reference

### Schema Definition Primitives
- `schema.string(): ZyraSchema`: creates a string schema.
- `schema.int(): ZyraSchema`: creates an integer schema.
- `schema.bool(): ZyraSchema`: creates a boolean schema.

### Constraint Combinators
- `schema.min(s: ZyraSchema, n: Int): ZyraSchema`: sets minimum length (strings) or minimum value (integers).
- `schema.max(s: ZyraSchema, n: Int): ZyraSchema`: sets maximum length or value.
- `schema.pattern(s: ZyraSchema, regex: String): ZyraSchema`: sets regular expression match pattern.
- `schema.required(s: ZyraSchema): ZyraSchema`: requires the field to be non-empty.

### Validation Runners
- `schema.validate(s: ZyraSchema, value: String): [String]`: validates `value` and returns a vector of error message strings.
- `schema.is_valid(s: ZyraSchema, value: String): Bool`: returns `true` if valid.

```zyra
def main(): Int {
  var user_schema = schema.string()
  user_schema = schema.required(user_schema)
  user_schema = schema.min(user_schema, 3)
  user_schema = schema.max(user_schema, 20)

  const valid = schema.is_valid(user_schema, "alice")
  print("Is valid: {valid}") // true

  const errors = schema.validate(user_schema, "a")
  print("Errors: {len(errors)}") // 1
  return 0
}
```

### `schema.validate_json(rules_json: String, data_json: String): [String]`
Validates a JSON data object against a JSON-defined ruleset:

```zyra
def main(): Int {
  const rules = "{\"username\": {\"type\": \"string\", \"min\": 3, \"required\": true}, \"age\": {\"type\": \"int\", \"min\": 18}}"
  const data = "{\"username\": \"bob\", \"age\": 25}"

  const errors = schema.validate_json(rules, data)
  print("Validation errors: {len(errors)}") // 0
  return 0
}
```
