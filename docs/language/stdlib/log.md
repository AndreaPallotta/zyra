# Logging Framework (`log`)

The `log` module provides structured, multi-level logging with console, file, and dual-output sinks and level filtering.

---

## Log Levels

- `DEBUG` (Level 0)
- `INFO` (Level 1, default)
- `WARN` (Level 2)
- `ERROR` (Level 3)

---

## Functions

### `log.info(message: String)`
Logs an informational message.

```zyra
log.info("Server started on port 8080")
```

### `log.warn(message: String)`
Logs a warning message.

```zyra
log.warn("High memory usage detected")
```

### `log.error(message: String)`
Logs an error message.

```zyra
log.error("Database connection dropped")
```

### `log.debug(message: String)`
Logs a debug message (suppressed when level is `INFO` or above).

### `log.set_level(level: String)`
Sets the active minimum log level (`"DEBUG"`, `"INFO"`, `"WARN"`, `"ERROR"`).

```zyra
log.set_level("DEBUG")
```

### `log.set_output(target: String)`
Configures log output sink: `"console"`, `"file"`, or `"both"`.

```zyra
log.set_output("both")
```

### `log.set_file(file_path: String)`
Configures the log file destination.

```zyra
log.set_file("app.log")
```
