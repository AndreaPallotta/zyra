# Zy UI: First-Class Declarative UI System (`.zyx`)

Zy UI brings first-class declarative markup syntax to Zyra, enabling developers to build user interfaces and fullstack web applications with the ergonomics of modern JSX and the zero-dependency compilation performance of Zyra.

---

## Overview

Zy UI uses the `.zyx` file extension (or inline markup within standard `.zy` files) to lower declarative HTML/XML component trees directly into optimized code across both Native Rust and JavaScript ESM compilation targets.

```zyx
def render_profile(name: String, role: String, count: Int): String {
  return (
    <div class="card p-4 shadow">
      <h2 class="title">{name}</h2>
      <p class="subtitle text-muted">{role}</p>
      <span class="badge badge-primary">Total Tasks: {count * 2}</span>
    </div>
  )
}
```

---

## Key Capabilities

### 1. Declarative Markup Syntax
Write natural HTML and XML structures directly in Zyra expressions without manual string concatenations:

```zyx
def header_view(title: String): String {
  return (
    <header class="navbar navbar-expand-lg bg-dark text-white">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">{title}</a>
        <nav class="nav">
          <a class="nav-link text-light" href="/docs">Docs</a>
          <a class="nav-link text-light" href="/api">API</a>
        </nav>
      </div>
    </header>
  )
}
```

### 2. Dynamic Attribute Interpolation
Attributes support string interpolation directly within quotes:

```zyx
def alert_banner(level: String, message: String): String {
  return (
    <div class="alert alert-{level} alert-dismissible" role="alert">
      <strong>Notice:</strong> {message}
    </div>
  )
}
```

### 3. Arbitrary Expression Interpolation
Curly braces `{expr}` allow inserting any valid Zyra expression, including arithmetic, function calls, and struct property accesses:

```zyx
def metric_card(label: String, value: Float, threshold: Float): String {
  return (
    <div class="card metric">
      <h3>{label}</h3>
      <p class="value">{value}</p>
      <span class="status">Deviation: {value - threshold}</span>
    </div>
  )
}
```

### 4. Component Composition
Because Zy UI components are standard Zyra functions returning markup, components compose naturally:

```zyx
def page_layout(title: String, content: String): String {
  return (
    <div class="page-container">
      {header_view(title)}
      <main class="content my-4">
        {content}
      </main>
      <footer class="footer py-3 text-center text-muted">
        <small>Powered by Zyra and Zy UI</small>
      </footer>
    </div>
  )
}
```

### 5. Self-Closing Tags
Standard void HTML elements are handled automatically with self-closing or explicit closing tags:

```zyx
def search_form(): String {
  return (
    <form class="d-flex" role="search" action="/search" method="GET">
      <input class="form-control me-2" type="search" name="q" placeholder="Search docs..." />
      <button class="btn btn-outline-success" type="submit">Search</button>
    </form>
  )
}
```

---

## Compiling and Running Zy UI Applications

Zy UI files can be executed, packaged, or tested like any other Zyra source file:

```bash
# Run application directly
zyra run src/app.zyx

# Compile to standalone native executable
zyra pack src/app.zyx -o dist/app.exe

# Build web distribution (JS ESM)
zyra build --target js src/app.zyx
```
