# Binary Protocol Codec Subpackage (`bin`)

The `bin` module provides endian-aware binary protocol serialization, format-string packing, and fixed-width numeric codecs.

---

## API Reference

### Format-String Packing and Unpacking
- `bin.pack(format: String, values: [String]): String`: packs values into a hexadecimal byte sequence according to Python struct-compatible format characters (`>`, `<`, `B`, `b`, `H`, `h`, `I`, `i`, `Q`, `q`, `<N>s`).
- `bin.unpack(format: String, hex: String): [String]`: unpacks a hex sequence back into string representations of packed fields.

```zyra
def main(): Int {
  const hex_data = bin.pack(">H4s", ["1000", "TEST"])
  const fields = bin.unpack(">H4s", hex_data)

  print("Port: {fields[0]}")
  print("Tag: {fields[1]}")
  return 0
}
```

### Dedicated Endian Numeric Codecs
- `bin.pack_u16_be(n: Int)` / `bin.pack_u16_le(n: Int)`
- `bin.pack_u32_be(n: Int)` / `bin.pack_u32_le(n: Int)`
- `bin.pack_u64_be(n: Int)` / `bin.pack_u64_le(n: Int)`
- `bin.unpack_u16_be(hex: String)` / `bin.unpack_u16_le(hex: String)`
- `bin.unpack_u32_be(hex: String)` / `bin.unpack_u32_le(hex: String)`
- `bin.unpack_u64_be(hex: String)` / `bin.unpack_u64_le(hex: String)`

```zyra
def main(): Int {
  const hex_val = bin.pack_u32_be(70000)
  const val = bin.unpack_u32_be(hex_val)

  print("Decoded: {val}") // 70000
  return 0
}
```
