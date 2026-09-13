# Distributed Event Bus Subpackage (`bus`)

The `bus` module provides a thread-safe in-process publish/subscribe message broker supporting hierarchical wildcard topic routing, subscription identifiers, and bounded history tracking.

---

## API Reference

### `bus.sub(pattern: String, handler: Function): Int`
Subscribes a callback function to a topic pattern. Returns a subscription handle identifier integer.
- Exact match: `"orders.created"`
- Single-level wildcard: `"orders.*"`
- Multi-level wildcard: `"*"` or `"**"`

```zyra
def main(): Int {
  const sub_id = bus.sub("telemetry.*", |topic: String, payload: String| {
    print("Received on {topic}: {payload}")
  })
  return 0
}
```

### `bus.pub(topic: String, payload: String): Int`
Publishes an event to `topic`. Handlers are dispatched in a lock-free execution context to prevent deadlocks. Returns the count of matching subscribers notified.

```zyra
def main(): Int {
  bus.pub("telemetry.cpu", "88.4")
  bus.pub("telemetry.memory", "4096")
  return 0
}
```

### `bus.unsub(id: Int): Bool`
Unregisters a subscription handle by ID. Returns `true` if found and removed.

### `bus.history(topic: String, limit: Int): [String]`
Retrieves up to `limit` previously published messages matching `topic`.

### `bus.clear(): Void`
Resets all subscribers and clears the event history log.
