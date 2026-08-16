# Cryptography Subpackage (`crypto`)

The `crypto` module provides SHA-256 and MD5 digest computation, alongside Base64 character encoding and decoding routines.

---

## API Reference

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
