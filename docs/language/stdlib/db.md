# Embedded Key-Value Storage (`db`)

The `db` module provides an embedded, persistent, ACID key-value database for local caching, session storage, and state management.

---

## Functions

### `db.open(path: String) -> ZyraKvDb`
Opens or creates a persistent key-value database file on disk.

```zyra
const store = db.open("app.db")
```

### `db.set(store: ZyraKvDb, key: String, value: String)`
Writes or updates a key-value pair and persists it atomically to disk.

```zyra
db.set(store, "auth_token", "secret123")
```

### `db.get(store: ZyraKvDb, key: String) -> String`
Retrieves the string value for a given key, or empty string if not found.

```zyra
const token = db.get(store, "auth_token")
```

### `db.has(store: ZyraKvDb, key: String) -> Bool`
Checks if a key exists in the database.

```zyra
if (db.has(store, "auth_token")) {
  print("Authenticated")
}
```

### `db.delete(store: ZyraKvDb, key: String) -> Bool`
Removes a key and its value from the store.

### `db.keys(store: ZyraKvDb) -> Vec[String]`
Returns all keys stored in the database.
