# Diff and Similarity Subpackage (`diff`)

The `diff` module provides string comparison algorithms, including unified diff line generation, Levenshtein edit distance, and normalized similarity metrics.

---

## API Reference

### `diff.levenshtein(a: String, b: String): Int`
Calculates the Levenshtein edit distance between string `a` and string `b` using dynamic programming with $O(m \cdot n)$ time complexity and $O(n)$ space.

```zyra
def main(): Int {
  const dist = diff.levenshtein("kitten", "sitting")
  print("Edit distance: {dist}") // 3
  return 0
}
```

### `diff.similarity(a: String, b: String): Float`
Computes the normalized similarity ratio between two strings on a scale from `0.0` (entirely distinct) to `1.0` (identical).

$$\text{similarity} = 1.0 - \frac{\text{levenshtein}(a, b)}{\max(\text{len}(a), \text{len}(b))}$$

```zyra
def main(): Int {
  const exact = diff.similarity("zyra", "zyra")
  const partial = diff.similarity("release_v1", "release_v2")

  print("Exact match: {exact}")   // 1.0
  print("Partial match: {partial}") // 0.9
  return 0
}
```

### `diff.lines(old_text: String, new_text: String): [String]`
Generates unified diff lines comparing two multi-line strings. Each line is prefixed with:
- `' '` for unchanged lines.
- `'-'` for deleted lines.
- `'+'` for inserted lines.

```zyra
def main(): Int {
  const old_doc = "alpha\nbeta\ngamma"
  const new_doc = "alpha\nbeta_v2\ngamma\ndelta"

  const lines = diff.lines(old_doc, new_doc)
  for line in lines {
    print(line)
  }
  return 0
}
```
