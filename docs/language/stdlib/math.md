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

### `math.clamp(x: Float, min: Float, max: Float): Float`
Clamps a value within the inclusive range `[min, max]`.

```zyra
const clamped = math.clamp(15.0, 0.0, 10.0) // Returns 10.0
```

### `math.lerp(start: Float, end: Float, t: Float): Float`
Computes linear interpolation between `start` and `end` with factor `t`: `start + (end - start) * t`.

```zyra
const interpolated = math.lerp(10.0, 20.0, 0.5) // Returns 15.0
```

### `math.min(a: Float, b: Float): Float`
Returns the minimum of two values.

```zyra
const minimum = math.min(10.0, 5.0) // Returns 5.0
```

### `math.max(a: Float, b: Float): Float`
Returns the maximum of two values.

```zyra
const maximum = math.max(10.0, 5.0) // Returns 10.0
```

### `math.dot(v1: [Float], v2: [Float]): Float`
Computes the vector dot product of two numerical vectors / arrays.

```zyra
const v1 = [1.0, 2.0, 3.0]
const v2 = [4.0, 5.0, 6.0]
const dot_product = math.dot(v1, v2) // Returns 32.0
```

### `math.norm(v: [Float]): Float`
Computes the Euclidean $L_2$ norm of a numerical vector.

```zyra
const magnitude = math.norm([3.0, 4.0]) // Returns 5.0
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
