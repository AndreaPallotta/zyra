# Installation

Zyra provides native installers and package distribution binaries for Windows, Linux, and macOS.

---

## Windows

Download and run the standalone **ZyraSetup.exe** installer binary:

1. Download `ZyraSetup.exe` from the [Latest Release](https://github.com/AndreaPallotta/zyra/releases/latest).
2. Double-click `ZyraSetup.exe`.
3. The setup tool will:
   - Copy `zyra.exe` to `%LocalAppData%\Programs\Zyra\bin`.
   - Automatically register Zyra in your Windows Environment `%PATH%`.
   - Optionally prompt to install the **Zyra VS Code Extension**.

Verify installation:
```powershell
zyra --help
```

---

## Linux / POSIX Shell

Install via one-line terminal command:

```bash
curl -fsSL https://zyra-lang.dev/get | bash
```

### Debian / Ubuntu / Zypper Package

Download the `.deb` package directly:
```bash
sudo dpkg -i zyra_1.0.0_amd64.deb
```

---

## VS Code Extension

Install the official **Zyra Programming Language** extension from the VS Code Marketplace or install manually via VSIX:

```bash
code --install-extension zyra-vscode-1.0.1.vsix
```
