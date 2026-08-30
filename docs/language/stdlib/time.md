# Time & Clock Subpackage (`time`)

The `time` module provides high-precision clocks, UNIX epoch timestamps, thread sleeping, duration measurements, and date formatting.

---

## API Reference

### `time.now(): String`
Returns the current UTC timestamp formatted as an ISO-8601 / RFC-3339 string.

```zyra
const current = time.now()
print("Current Time: {current}")
// Output: 2026-08-30 00:34:55 UTC
```

### `time.unix(): Int`
Returns the current UNIX epoch timestamp in seconds.

```zyra
const epoch = time.unix()
print("UNIX Epoch: {epoch}")
```

### `time.unix_ms(): Int`
Returns the current UNIX epoch timestamp in milliseconds.

```zyra
const epoch_ms = time.unix_ms()
print("Epoch (ms): {epoch_ms}")
```

### `time.sleep(ms: Int): Void`
Pauses the current execution thread for the specified number of milliseconds.

```zyra
time.sleep(100) // Sleep 100 milliseconds
```

### `time.elapsed(start_ts: Int): Int`
Calculates the elapsed milliseconds between the current time and a starting timestamp from `time.unix_ms()`.

```zyra
const start = time.unix_ms()
// ... execute work ...
const duration = time.elapsed(start)
print("Work completed in {duration} ms")
```

### `time.format(ts: Int, fmt: String): String`
Formats a UNIX epoch timestamp (in seconds) into a date and time string.

```zyra
const formatted = time.format(1700000000, "%Y-%m-%d %H:%M:%S")
print("Date: {formatted}")
// Output: 2023-11-14 22:13:20 UTC
```
