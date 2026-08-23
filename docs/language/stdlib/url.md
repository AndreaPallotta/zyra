# URL & Query Parameter Parser (`url`)

The `url` module provides parsing, component extraction, and percent-encoding/decoding for URLs and query strings.

---

## Functions

### `url.parse(raw: String) -> ZyraUrl`
Parses a full URL string into structured components (protocol, host, port, path, query, fragment).

```zyra
const u = url.parse("https://api.zyra-lang.dev:8080/v1/search?q=syntax&sort=asc#results")
```

### `url.get(url_obj: ZyraUrl, component: String) -> String`
Extracts a component by name (`"protocol"`, `"host"`, `"port"`, `"path"`, `"query"`, `"fragment"`).

```zyra
const host = url.get(u, "host") // "api.zyra-lang.dev"
const path = url.get(u, "path") // "/v1/search"
```

### `url.get_param(url_obj: ZyraUrl, param: String) -> String`
Extracts the decoded value of a named query parameter.

```zyra
const q = url.get_param(u, "q") // "syntax"
```

### `url.encode(text: String) -> String`
Percent-encodes a string for safe inclusion in URLs.

### `url.decode(text: String) -> String`
Decodes a percent-encoded URL string back to UTF-8.
