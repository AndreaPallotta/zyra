# Standard Library

Zyra includes built-in primitives for string manipulation, type casting, and file system I/O.

---

## String Functions

### `len(s: String): Int`
Returns string length:
```zyra
const length = len("hello world") // 11
```

### `substr(s: String, start: Int, len: Int): String`
Extracts a substring:
```zyra
const sub = substr("zyra language", 0, 4) // "zyra"
```

### `trim(s: String): String`
Trims whitespace:
```zyra
const clean = trim("  zyra  ") // "zyra"
```

### `contains(s: String, sub: String): Bool`
Substring search:
```zyra
const is_found = contains("zyra lang", "zyra") // true
```

---

## File System I/O

### `file_read(path: String): String`
Reads entire file text:
```zyra
const content = file_read("config.txt")
```

### `file_write(path: String, content: String): Bool`
Writes text to file:
```zyra
const success = file_write("output.txt", "Zyra compiled content")
```
