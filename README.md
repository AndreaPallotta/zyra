# Zyra Programming Language

Zyra is a fast, expressive, statically-typed compiled programming language designed to combine the performance and memory safety of Rust with the simplicity and developer velocity of Go.

It features a 100% self-hosted compiler written in pure Zyra that compiles down to both native C and Rust executables as well as JavaScript ESM modules.

Documentation: https://zyra-lang.dev
Repository: https://github.com/AndreaPallotta/zyra

## Key Features

- Native Standalone Binaries: Compiles to zero-dependency native executables via the Rust backend.
- Algebraic Data Types: First-class struct data structures, tagged enum variants, and pattern matching match expressions.
- First-Class String Interpolation: Embed variables directly in string literals using "Hello {name}".
- Self-Hosted Architecture: Lexer, parser, checker, and CLI driver implemented in pure Zyra.
- IDE Tooling: Official VS Code extension providing syntax highlighting, autocompletion, hover tooltips, and interactive Code Lens buttons.

## Installation

### Windows

Download and run ZyraSetup.exe from the latest release:

1. Download ZyraSetup.exe from GitHub Releases.
2. Run ZyraSetup.exe to install zyra.exe into %LocalAppData%\Programs\Zyra\bin and update your PATH.
3. Select the option to install the VS Code extension during setup.

Verify installation:
```powershell
zyra help
```

### Linux

Install using the terminal one-line script:

```bash
curl -fsSL https://zyra-lang.dev/get | bash
```

Alternatively, download and install the Debian package:

```bash
sudo dpkg -i zyra_1.0.0_amd64.deb
```

### VS Code Extension

Install the official Zyra Programming Language extension from the VS Code Marketplace or install manually via VSIX:

```bash
code --install-extension zyra-vscode-1.0.2.vsix
```

## CLI Usage

Initialize a new project:
```bash
zyra init my_app
```

Compile and run a Zyra file natively:
```bash
zyra run src/main.zy
```

Compile to native binary without running:
```bash
zyra build src/main.zy --target rust --native
```

Compile to JavaScript ESM module:
```bash
zyra build src/main.zy --target js
```

Launch the interactive REPL shell:
```bash
zyra repl
```

## Hello World Example

```zyra
struct User {
  id: Int
  name: String
}

def main(): Int {
  const user = User { id: 1, name: "Andrea" }
  print("Hello, {user.name}!")
  return 0
}
```

## License

MIT License.
