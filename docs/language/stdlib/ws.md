# WebSockets Subpackage (`ws`)

The `ws` module provides zero-dependency full-duplex WebSocket client primitives for connecting to real-time microservices, streaming feeds, and chat protocols.

---

## API Reference

### `ws.connect(url: String): WebSocket`
Establishes a WebSocket connection to the target URL (e.g. `ws://127.0.0.1:8080/feed`).

```zyra
var socket = ws.connect("ws://127.0.0.1:8080/events")
```

### `ws.send(socket: WebSocket, message: String): Int`
Sends a text payload across the socket. Returns total payload bytes sent, or `-1` on error.

```zyra
ws.send(socket, "{\"event\": \"subscribe\", \"channel\": \"telemetry\"}")
```

### `ws.recv(socket: WebSocket): String`
Reads the next available text message from the socket buffer. Returns an empty string if no messages are queued.

```zyra
const incoming = ws.recv(socket)
print("Received event: {incoming}")
```

### `ws.close(socket: WebSocket): Int`
Closes the underlying TCP stream connection. Returns `0` on success.

```zyra
ws.close(socket)
```
