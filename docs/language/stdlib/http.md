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
