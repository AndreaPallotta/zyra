# Concurrency & Channels (`chan`)

The `chan` module provides CSP-style message passing channels and thread spawning for lock-free communication between threads.

---

## Functions

### `chan.new() -> ZyraChannel`
Creates a new multi-producer, single-consumer communication channel.

```zyra
const c = chan.new()
```

### `chan.clone(channel: ZyraChannel) -> ZyraChannel`
Clones a channel endpoint so multiple producer threads can send messages.

```zyra
const tx = chan.clone(c)
```

### `chan.send(channel: ZyraChannel, msg: String)`
Sends a message into the channel.

```zyra
chan.send(tx, "task_done")
```

### `chan.recv(channel: ZyraChannel) -> String`
Blocks until a message is received from the channel.

```zyra
const msg = chan.recv(c)
```

### `chan.try_recv(channel: ZyraChannel) -> String`
Non-blocking receive attempt. Returns the message if available, or an empty string if queue is empty.

### `spawn(task: Fn)`
Spawns an independent OS thread to execute the provided closure.

```zyra
spawn(move || {
  chan.send(tx, "processed")
})
```
