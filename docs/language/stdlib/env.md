# Environment Subpackage (`env`)

The `env` module provides access to process environment variables, invocation arguments, and structured configuration file loading.

---

## API Reference

### `env.get(key: String): String`
Retrieves the value of environment variable `key`. Returns an empty string `""` if the key is not set.

```zyra
const port = env.get("PORT")
if (len(port) == 0) {
  print("PORT variable not defined, using 8080")
}
```

### `env.set(key: String, value: String): Int`
Sets or updates environment variable `key` with value `value`. Returns `0` on success.

```zyra
const result = env.set("LOG_LEVEL", "debug")
```

### `env.args(): Vector[String]`
Returns a vector containing the command-line arguments passed when invoking the application.

```zyra
const args = env.args()
for arg in args {
  print("CLI Argument: {arg}")
}
```

### `env.load(path: String): String`
Reads and parses a nested YAML-style configuration file (such as `zyra.env`) and populates hierarchical keys directly into environment variables.

```zyra
const _ = env.load("zyra.env")
const db_host = env.get("database.host")
const db_port = env.get("database.port")

print("Connecting to database at {db_host}:{db_port}")
```

---

## Structured `zyra.env` Format

The `env.load()` function supports hierarchical sections using nested indentation:

```yaml
server:
  port: 8080
  host: 127.0.0.1
database:
  host: localhost
  port: 5432
  url: postgres://localhost:5432/zyra_db
```

This populates environment variables named `server.port`, `server.host`, `database.host`, `database.port`, and `database.url`.
