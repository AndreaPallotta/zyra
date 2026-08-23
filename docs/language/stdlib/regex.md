# Regular Expressions (`regex`)

The `regex` module provides regular expression pattern matching, extraction, search-and-replace, and splitting capabilities.

---

## Functions

### `regex.is_match(pattern: String, text: String) -> Bool`
Returns `true` if the regex pattern matches anywhere within the input text.

```zyra
const matched = regex.is_match("^zyra-[0-9]+$", "zyra-42")
```

### `regex.find(pattern: String, text: String) -> String`
Returns the first substring matching the pattern, or an empty string if no match is found.

```zyra
const token = regex.find("v[0-9]+\\.[0-9]+", "Current release is v2.3.0")
```

### `regex.find_all(pattern: String, text: String) -> Vec[String]`
Returns all non-overlapping matches as a vector of strings.

```zyra
const numbers = regex.find_all("[0-9]+", "item1, item2, item3")
```

### `regex.replace(pattern: String, text: String, replacement: String) -> String`
Replaces all occurrences of the pattern with the specified replacement string.

```zyra
const sanitized = regex.replace("\\s+", "hello    world", " ")
```

### `regex.split(pattern: String, text: String) -> Vec[String]`
Splits a string by matching regular expression delimiters.

```zyra
const parts = regex.split("[,;\\s]+", "apple,banana; cherry date")
```
