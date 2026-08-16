# Path Resolution Subpackage (`path`)

The `path` module offers cross-platform file path resolution, extension parsing, and directory inspection.

---

## API Reference

### `path.join(a: String, b: String): String`
Joins two path components using the native platform path separator (`\` on Windows, `/` on POSIX systems).

```zyra
const full_path = path.join("dist", "main.rs")
print("Native path: {full_path}")
```

### `path.exists(path: String): Bool`
Checks if a target file or directory exists on the file system. Returns `true` if found, `false` otherwise.

```zyra
if (path.exists("zyra.json")) {
  print("Found project manifest")
}
```

### `path.ext(path: String): String`
Extracts the extension of a file path (excluding leading dot). Returns an empty string if no extension is present.

```zyra
const ext = path.ext("src/main.zy") // Returns "zy"
print("File extension: {ext}")
```

### `path.basename(path: String): String`
Extracts the trailing file name component of a path.

```zyra
const filename = path.basename("src/core/compiler.zy") // Returns "compiler.zy"
print("Filename: {filename}")
```

### `path.dirname(path: String): String`
Returns the parent directory path containing the file.

```zyra
const dir = path.dirname("src/core/compiler.zy") // Returns "src/core"
print("Parent directory: {dir}")
```
