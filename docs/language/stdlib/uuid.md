# UUID Generation and Validation Subpackage (`uuid`)

The `uuid` module provides generation and validation routines for random UUIDv4 and RFC-9562 timestamp-ordered UUIDv7 identifiers.

---

## API Reference

### `uuid.v4(): String`
Generates a random RFC-4122 Version 4 UUID formatted as a 36-character hyphenated string (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`).

```zyra
def main(): Int {
  const id = uuid.v4()
  print("Random UUIDv4: {id}")
  return 0
}
```

### `uuid.v7(): String`
Generates an RFC-9562 Version 7 UUID. UUIDv7 prefixes a 48-bit Big-Endian millisecond Unix epoch timestamp, ensuring that generated identifiers sort monotonically in chronological order when stored or indexed.

```zyra
def main(): Int {
  const id1 = uuid.v7()
  time.sleep(2)
  const id2 = uuid.v7()

  print("ID 1: {id1}")
  print("ID 2: {id2}")
  print("Chronologically ordered: {id1 < id2}") // true
  return 0
}
```

### `uuid.is_valid(id: String): Bool`
Validates whether a string matches the canonical 36-character 8-4-4-4-12 hex UUID pattern.

```zyra
def main(): Int {
  const valid = uuid.is_valid("018e3a2b-8a4e-7b5c-9c12-3456789abcde")
  const invalid = uuid.is_valid("not-a-valid-uuid")

  print("Valid: {valid}")     // true
  print("Invalid: {invalid}") // false
  return 0
}
```
