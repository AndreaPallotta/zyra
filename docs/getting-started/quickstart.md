# Quickstart Guide

Get up and running with your first Zyra program in 2 minutes!

---

## 1. Create a Zyra File

Create a file named `hello.zy`:

```zyra
def main(): Int {
  const name = "Zyra Developer"
  print("Hello, {name}! Welcome to Zyra.")
  return 0
}
```

---

## 2. Compile & Run Natively

Compile `hello.zy` into a native standalone binary:

```bash
zyra build hello.zy --target rust --native
```

Run the compiled executable:

=== "Windows"
    ```powershell
    .\hello.exe
    ```

=== "Linux / macOS"
    ```bash
    ./hello
    ```

---

## 3. Compile to JavaScript ESM

Target Node.js or browser environments:

```bash
zyra build hello.zy --target js
node hello.mjs
```
