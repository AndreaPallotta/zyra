# Math and Random Subpackage (`math` and `random`)

The `math` and `random` modules provide mathematical operations and pseudo-random number generation.

---

## Math API Reference (`math`)

### `math.sqrt(x: Float): Float`
Computes the square root of double-precision floating-point number `x`.

```zyra
const root = math.sqrt(25.0) // Returns 5.0
```

### `math.abs(x: Float): Float`
Computes the absolute value of floating-point number `x`.

```zyra
const absolute = math.abs(-42.5) // Returns 42.5
```

### `math.floor(x: Float): Float`
Returns the largest integer value less than or equal to `x`.

```zyra
const val = math.floor(3.89) // Returns 3.0
```

### `math.ceil(x: Float): Float`
Returns the smallest integer value greater than or equal to `x`.

```zyra
const val = math.ceil(3.14) // Returns 4.0
```

---

## Random API Reference (`random`)

### `random.int(min: Int, max: Int): Int`
Generates a pseudo-random 64-bit signed integer in the closed range `[min, max]`.

```zyra
const dice = random.int(1, 6)
print("Rolled: {dice}")
```

### `random.float(): Float`
Generates a pseudo-random double-precision floating-point value in the half-open range `[0.0, 1.0)`.

```zyra
const probability = random.float()
print("Probability: {probability}")
```
