# In-Memory Map & Dictionary (`map`)

The `map` module provides thread-safe, fast in-memory hash maps and dictionaries.

---

## Functions

### `map.new() -> ZyraMap`
Creates an empty thread-safe in-memory map.

```zyra
const m = map.new()
```

### `map.set(m: ZyraMap, key: String, value: String)`
Sets or updates a key-value entry.

```zyra
map.set(m, "Content-Type", "application/json")
```

### `map.get(m: ZyraMap, key: String) -> String`
Looks up a key and returns its value, or an empty string if missing.

```zyra
const ct = map.get(m, "Content-Type")
```

### `map.has(m: ZyraMap, key: String) -> Bool`
Checks if a key exists in the map.

### `map.delete(m: ZyraMap, key: String) -> Bool`
Deletes an entry by key. Returns `true` if key was present.

### `map.keys(m: ZyraMap) -> Vec[String]`
Returns all keys in the map.

### `map.values(m: ZyraMap) -> Vec[String]`
Returns all values in the map.

### `map.len(m: ZyraMap) -> Int`
Returns the count of entries in the map.

### `map.clear(m: ZyraMap)`
Clears all entries from the map.
