# Control Flow, Loops, and Pattern Matching

Zyra provides structured control flow primitives including conditional branching, expression-based `if`/`else` evaluation, iterative loops, and pattern matching using `match`.

---

## Conditional Branching (`if`, `else if`, `else`)

Conditional statements execute code blocks based on boolean expressions. Parentheses around condition expressions are optional in standard Zyra syntax.

```zyra
const score = 85

if (score >= 90) {
  print("Grade: A")
} else if (score >= 80) {
  print("Grade: B")
} else if (score >= 70) {
  print("Grade: C")
} else {
  print("Grade: F")
}
```

### Expression-Based Conditionals
In Zyra, `if` statements can evaluate directly to a value, allowing inline assignment without temporary variable mutation:

```zyra
const status_code = 200
const category = if (status_code == 200) "Success" else "Error"

print("Category: {category}")
```

---

## Pattern Matching (`match`)

The `match` construct provides pattern matching against scalar values, enumeration variants, and algebraic types such as `Option[T]` and `Result[T, E]`.

### Matching Values
```zyra
const status = 200

const message = match (status) {
  200 => "OK - Request Succeeded"
  404 => "Not Found - Resource Missing"
  500 => "Internal Server Error"
  _ => "Unknown Status Code"
}

print(message)
```

### Destructuring Algebraic Data Types
`match` can destructure `Some`/`None` from `Option[T]` and `Ok`/`Err` from `Result[T, E]`:

```zyra
const user_option = Some("Andrea")

match (user_option) {
  Some(name) => print("User logged in: {name}")
  None => print("Guest session")
}
```

### Tuple Destructuring & Match Guards
`match` supports tuple patterns with conditional `if` guard expressions:

```zyra
const point = (5, 5)

const description = match (point) {
  (0, 0) => "origin",
  (x, y) if x == y => "diagonal",
  (x, 0) => "x-axis",
  (0, y) => "y-axis",
  (x, y) => "point at ({x}, {y})",
}

print("Point classification: {description}")
```

---

## Error Propagation Operator (`?`)

Zyra provides a postfix `?` try operator for propagating `Err` or `None` up to calling functions without nested `match` boilerplate:

```zyra
def read_config(path: String): Result[Config, String] {
  const content = file_read(path)?
  const config = json.parse(content)?
  return Ok(config)
}
```

When an expression evaluates to `Ok(val)` or `Some(val)`, the `?` operator extracts the underlying value. If it evaluates to `Err(e)` or `None`, the function returns early with that failure.

---

## Loops and Iteration

Zyra supports both conditional `while` loops and sequence iteration via `for`.

### `while` Loops
The `while` loop continues executing as long as the condition evaluates to `true`.

```zyra
var count = 0

while (count < 5) {
  print("Iteration: {count}")
  count = count + 1
}
```

### Array Iteration
Loop through items in a collection or vector:

```zyra
const items = ["apple", "banana", "cherry"]

for item in items {
  print("Item: {item}")
}
```

### Early Loop Controls (`break` and `continue`)
- `break`: Instantly terminates loop execution.
- `continue`: Skips the remainder of the current loop iteration and proceeds to the next cycle.

```zyra
var idx = 0

while (idx < 10) {
  idx = idx + 1
  if (idx == 3) {
    continue
  }
  if (idx == 7) {
    break
  }
  print("Active index: {idx}")
}
```
