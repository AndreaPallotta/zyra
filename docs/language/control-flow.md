# Control Flow & Match

Zyra provides `if` / `else` conditionals and `match` pattern expressions.

---

## Conditionals

```zyra
if (x > 10) {
  print("Greater than 10")
} else {
  print("10 or less")
}
```

---

## Pattern Matching (`match`)

```zyra
const label = match (status) {
  Active(user) => "Online: {user}"
  Pending => "Pending"
  _ => "Unknown"
}
```
