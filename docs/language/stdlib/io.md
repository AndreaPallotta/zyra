# File I/O and Watcher Subpackage (`io`)

The `io` module provides unified format-aware file reading and writing routines, along with a non-callback async file watcher handle.

---

## API Reference

### `io.read(path: String): String`
Auto-detects file extension (`.json`, `.yaml`, `.toml`, `.csv`) and reads file content into memory.

```zyra
const raw_text = io.read("data.txt")
const json_data = io.read("config.json")
```

### `io.write(path: String, content: String): Int`
Writes string `content` to target file path. Returns `0` on success, or `-1` on error.

### `io.lines(path: String): [String]`
Reads file lines into an array of strings without loading excessive auxiliary buffers.

```zyra
const log_lines = io.lines("app.log")
for line in log_lines {
  if (contains(line, "ERROR")) {
    print("Found error: {line}")
  }
}
```

### `io.append(path: String, content: String): Int`
Appends string `content` to the end of a file, creating it if it does not already exist. Returns bytes written, or `-1` on failure.

```zyra
io.append("logs/audit.log", "[2026-08-30] User login from 127.0.0.1\n")
```

### `io.pipe(src_path: String, dest_path: String): Int`
Streams source file contents directly to destination file. Returns total bytes transferred, or `-1` on failure.

```zyra
const bytes_copied = io.pipe("source.dat", "backup.dat")
```

### `io.watch(path: String): FileWatcher`
Spawns a lightweight file watcher handle for the target file path. The returned `FileWatcher` object maintains non-blocking modification timestamps.

```zyra
var watcher = io.watch("src/main.zy")
```

### `io.has_changed(watcher: FileWatcher): Bool`
Checks if the file associated with `watcher` has been updated on disk since the previous check. Returns `true` if modified, updating internal state.

```zyra
def main(): Int {
  var watcher = io.watch("src/main.zy")
  while (true) {
    if (io.has_changed(watcher)) {
      print("Source file src/main.zy modified on disk")
    }
    sleep_ms(500)
  }
  return 0
}
```

---

## Format-Aware Automatic Parsers

| Extension | Parsing Behavior | Return Format |
| :--- | :--- | :--- |
| `.json` | Parses JSON payload into structured object representation | Object / String |
| `.yaml` / `.yml` | Reads YAML configuration structure | String |
| `.toml` | Reads TOML structure | String |
| `.csv` | Splits CSV rows into record vectors | Array of lines |
| Other | Reads raw text content | String |
