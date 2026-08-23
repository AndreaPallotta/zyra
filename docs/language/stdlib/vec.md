# Vector Utilities (`vec`)

The `vec` module provides vector transformations, filtering, sorting, deduplication, and collection manipulation.

---

## Functions

### `vec.sort(items: Vec[T]) -> Vec[T]`
Returns a new vector sorted in ascending natural order.

```zyra
const fruits = ["banana", "apple", "cherry"]
const sorted = vec.sort(fruits) // ["apple", "banana", "cherry"]
```

### `vec.reverse(items: Vec[T]) -> Vec[T]`
Returns a reversed copy of the vector.

### `vec.unique(items: Vec[T]) -> Vec[T]`
Returns elements with duplicates removed, preserving first-seen order.

```zyra
const deduped = vec.unique(["a", "b", "a", "c"]) // ["a", "b", "c"]
```

### `vec.join(items: Vec[String], delimiter: String) -> String`
Joins vector elements into a single string with the specified delimiter.

```zyra
const s = vec.join(["2026", "08", "23"], "-") // "2026-08-23"
```

### `vec.contains(items: Vec[T], item: T) -> Bool`
Returns `true` if the vector contains the specified item.

### `vec.slice(items: Vec[T], start: Int, end: Int) -> Vec[T]`
Returns a subvector slice from index `start` up to index `end`.

### `vec.filter(items: Vec[T], predicate: Fn(T) -> Bool) -> Vec[T]`
Returns a filtered vector containing elements that satisfy the predicate closure.

```zyra
const even = vec.filter([1, 2, 3, 4], |x| { return x % 2 == 0 })
```

### `vec.map(items: Vec[T], transform: Fn(T) -> U) -> Vec[U]`
Applies a transformation closure to each element and returns a new vector.

```zyra
const doubled = vec.map([1, 2, 3], |x| { return x * 2 })
```

### `vec.find(items: Vec[T], predicate: Fn(T) -> Bool) -> Option[T]`
Returns the first element that satisfies the predicate.
