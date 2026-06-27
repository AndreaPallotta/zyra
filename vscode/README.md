# Zyra VSCode Extension

This is the VS Code extension for the Zyra language, providing syntax coloring and language support by integrating the custom **Zyra LSP Server**.

## Features
- **Real-time Diagnostics**: Visual feedback on lexer, parser, and type checker errors/warnings.
- **Type Hovers**: Hover over variables, functions, and structs to view their signatures.
- **Go to Definition**: Jump directly to variable or function declarations.
- **Syntax Highlighting**: Complete syntax highlighting using TextMate grammar.

## Build & Test

The extension bundles the LSP server in its build process. You can compile the extension and bundle the server by running from the monorepo root:
```bash
npm run build -w core && npm run build -w vscode
```

Alternatively, from the `vscode` directory:
```bash
npm install
npm run build
npm test
```

## Package
To package the extension into a `.vsix` file:
```bash
npx @vscode/vsce package
```
