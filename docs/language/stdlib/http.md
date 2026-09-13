# Networking and HTTP Subpackage (`http`)

The `http` module provides asynchronous REST client request primitives and an embedded HTTP web server listener.

---

## API Reference

### `http.get(url: String): String`
Executes an HTTP GET request to the target `url` and returns the response payload text. Parameterized execution prevents command injection.

```zyra
async def fetch_user(): Result[Int, String] {
  const body = http.get("https://api.github.com/users/AndreaPallotta")
  print("Response: {body}")
  return Ok(0)
}
```

### `http.post(url: String, body: String): String`
Executes an HTTP POST request to the target `url` with payload `body`.

```zyra
const response = http.post("https://httpbin.org/post", "{\"key\":\"value\"}")
```

### In-Memory Network Mocking (`http.mock`)
Enables zero-socket in-memory network stubbing for unit tests and local simulation:

- `http.mock(pattern: String, status: Int, body: String): Void`: Registers a mock responder for any matching URL. Supports exact URLs and wildcard patterns (`*`, `**`).
- `http.mock_history(): [String]`: Returns an audit log of all intercepted calls in `"METHOD URL"` format.
- `http.mock_reset(): Void`: Clears all registered mock routes and flushes recorded call history.

```zyra
def main(): Int {
  http.mock("https://api.zyra.io/v1/users", 200, "{\"status\": \"ok\", \"count\": 42}")
  http.mock("https://api.zyra.io/v1/audit/*", 200, "{\"audit\": true}")

  const res = http.get("https://api.zyra.io/v1/users")
  print("Response: {res}")

  const history = http.mock_history()
  print("Calls recorded: {len(history)}")

  http.mock_reset()
  return 0
}
```

### `http.listen(addr: String, handler: Function): Int`
Spawns an embedded HTTP web server listening on `addr` (e.g. `"0.0.0.0:8080"`). Incoming requests pass an `HttpRequest` object to `handler`, which must return an `HttpResponse` object.

```zyra
struct HttpRequest {
  method: String
  path: String
  body: String
}

struct HttpResponse {
  status: Int
  body: String
}

def handle_request(req: HttpRequest): HttpResponse {
  print("Incoming {req.method} request to {req.path}")
  return HttpResponse { status: 200, body: "Hello from Zyra Web Server" }
}

def main(): Int {
  print("Starting Zyra HTTP Server on 0.0.0.0:8080...")
  return http.listen("0.0.0.0:8080", handle_request)
}
```
