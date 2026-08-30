# Cryptography Subpackage (`crypto`)

The `crypto` module provides SHA-256 and MD5 digest computation, Base64 encoding/decoding, UUIDv4 generation, HMAC-SHA256 signatures, and JWT token authentication.

---

## API Reference

### `crypto.uuid(): String`
Generates a random RFC 4122 version 4 UUID string (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`).

```zyra
const id = crypto.uuid()
print("Generated UUID: {id}")
// Output: f53bcc36-ac09-4acf-a42c-dd45aedb02d9
```

### `crypto.hmac_sha256(key: String, message: String): String`
Computes the 64-character hexadecimal HMAC-SHA256 signature for `message` using the provided secret `key`.

```zyra
const sig = crypto.hmac_sha256("secret_key", "payload_message")
print("HMAC-SHA256: {sig}")
```

### `crypto.jwt_encode(payload_json: String, secret: String): String`
Encodes a JSON payload into an RFC 7519 compliant JSON Web Token (JWT) with HS256 HMAC-SHA256 signature and Base64URL encoding.

```zyra
const payload = "{\"sub\":\"1234567890\",\"name\":\"Andrea Pallotta\",\"admin\":true}"
const token = crypto.jwt_encode(payload, "secret_key")
print("JWT Token: {token}")
```

### `crypto.jwt_decode(token: String, secret: String): String`
Validates the HS256 signature on `token` with `secret` and decodes the payload JSON. Returns an empty string if the signature is invalid or the token is malformed.

```zyra
const payload = crypto.jwt_decode(token, "secret_key")
print("Payload: {payload}")
```

### `crypto.sha256(data: String): String`
Computes the 64-character lower-case hexadecimal SHA-256 cryptographic digest of `data`. Uses platform security libraries (`System.Security.Cryptography.SHA256` on Windows, `sha256sum` on POSIX systems).

```zyra
const digest = crypto.sha256("zyra v2.2.0")
print("SHA-256 Digest: {digest}")
// Output: 64-character hex string
```

### `crypto.md5(data: String): String`
Computes the 32-character lower-case hexadecimal MD5 digest of `data`.

```zyra
const hash = crypto.md5("zyra v2.2.0")
print("MD5 Digest: {hash}")
```

### `crypto.base64_encode(data: String): String`
Encodes raw UTF-8 input string `data` into Base64 format.

```zyra
const encoded = crypto.base64_encode("Zyra Compiler Engine")
print("Base64 Encoded: {encoded}")
```

### `crypto.base64_decode(encoded: String): String`
Decodes Base64 formatted string `encoded` back to original UTF-8 plain text.

```zyra
const decoded = crypto.base64_decode("WnlyYSBDb21waWxlciBFbmdpbmU=")
print("Decoded: {decoded}")
```
