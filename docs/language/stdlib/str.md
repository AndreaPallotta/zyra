# String Utilities Subpackage (`str`)

The `str` module provides text manipulation routines including splitting, case conversion, and pattern replacement.

---

## API Reference

### `str.split(text: String, delimiter: String): Vector[String]`
Splits `text` into a vector of substrings separated by `delimiter`.

```zyra
const parts = str.split("apple,banana,cherry", ",")
for fruit in parts {
  print("Fruit: {fruit}")
}
```

### `str.lower(text: String): String`
Converts all characters in `text` to lower case.

```zyra
const lower = str.lower("ZYRA LANGUAGE") // Returns "zyra language"
print(lower)
```

### `str.upper(text: String): String`
Converts all characters in `text` to upper case.

```zyra
const upper = str.upper("zyra language") // Returns "ZYRA LANGUAGE"
print(upper)
```

### `str.replace(text: String, target: String, replacement: String): String`
Replaces all occurrences of `target` substring within `text` with `replacement`.

```zyra
const original = "Hello World"
const updated = str.replace(original, "World", "Zyra") // Returns "Hello Zyra"
print(updated)
```
