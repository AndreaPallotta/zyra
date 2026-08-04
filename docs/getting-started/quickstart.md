# Quickstart Guide

Get up and running with your first Zyra v2.0 program in 2 minutes!

---

## 1. Create a Zyra Project

Initialize a new project or scaffold from a template:

```bash
zyra create web my_web_app
cd my_web_app
```

---

## 2. Compile & Run Natively

Run `src/main.zy` in a single step:

```bash
zyra run src/main.zy
```

Or start the **hot-reloading dev server**:

```bash
zyra dev src/main.zy
```

---

## 3. Compile to WebAssembly or JavaScript

Target WebAssembly or browser environments:

```bash
# Compile to WebAssembly (.wasm)
zyra build src/main.zy --target=wasm32

# Compile to JavaScript ESM (.mjs)
zyra build src/main.zy --target js
```

---

## 4. Run Unit Tests & Security Audit

```bash
# Run unit tests
zyra test

# Check code coverage
zyra coverage

# Scan for security risks
zyra audit
```
