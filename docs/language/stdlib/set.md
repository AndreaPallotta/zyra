# Mathematical Set Subpackage (`set`)

The `set` module provides a thread-safe mathematical set data structure and algebraic operations including union, intersection, difference, and subset checks.

---

## API Reference

### `set.new(): ZyraSet`
Instantiates a new empty set.

```zyra
def main(): Int {
  const s = set.new()
  set.add(s, "apple")
  set.add(s, "banana")
  print("Set length: {set.len(s)}")
  return 0
}
```

### `set.add(s: ZyraSet, elem: String): Bool`
Inserts `elem` into set `s`. Returns `true` if element was newly inserted, or `false` if already present.

### `set.has(s: ZyraSet, elem: String): Bool`
Returns `true` if `elem` is present in set `s`.

### `set.remove(s: ZyraSet, elem: String): Bool`
Removes `elem` from set `s`. Returns `true` if element was present and removed.

### `set.len(s: ZyraSet): Int`
Returns the total count of elements in the set.

### `set.to_vec(s: ZyraSet): [String]`
Returns a sorted vector of all elements contained in the set.

---

## Set Algebra Operations

### `set.union(a: ZyraSet, b: ZyraSet): ZyraSet`
Computes the set union ($A \cup B$) containing all elements from both sets.

### `set.intersection(a: ZyraSet, b: ZyraSet): ZyraSet`
Computes the set intersection ($A \cap B$) containing only elements present in both sets.

### `set.difference(a: ZyraSet, b: ZyraSet): ZyraSet`
Computes the set difference ($A \setminus B$) containing elements in `a` that are not in `b`.

### `set.is_subset(a: ZyraSet, b: ZyraSet): Bool`
Returns `true` if set `a` is a subset of set `b` ($A \subseteq B$).

```zyra
def main(): Int {
  const a = set.new()
  set.add(a, "x")
  set.add(a, "y")

  const b = set.new()
  set.add(b, "y")
  set.add(b, "z")

  const u = set.union(a, b)         // {"x", "y", "z"}
  const inter = set.intersection(a, b) // {"y"}
  const diff = set.difference(a, b)    // {"x"}

  print("Intersection has y: {set.has(inter, \"y\")}")
  print("Is subset: {set.is_subset(inter, a)}") // true
  return 0
}
```
