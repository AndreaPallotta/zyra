# Windows Native GUI Setup Wizard Specification

## Overview

Replace the console-based `ZyraSetup.exe` installer with a modern Windows GUI Setup Wizard featuring custom brand graphics, interactive step navigation, component selection checkboxes, path selection, progress bar, and registry integration.

---

## Features & User Experience

### 1. Welcome Screen
- Zyra logo header graphic and tagline.
- Overview of installed components (Zyra Compiler CLI, VS Code Extension).
- "Next" and "Cancel" control buttons.

### 2. Component Selection Screen
- **Destination Folder Picker**: Default `%LocalAppData%\Programs\Zyra`.
- **Install Options Checkboxes**:
  - `[x]` Zyra Core Compiler & Native Executable CLI (`zyra.exe`)
  - `[x]` Add Zyra to Windows System PATH Environment Variable
  - `[x]` Install Zyra Official VS Code Extension (`zyra-vscode`)
  - `[x]` Create Desktop / Start Menu Shortcuts

### 3. Installation Progress Screen
- Visual progress bar.
- Status log displaying extraction progress, directory creation, PATH registry updating, and VSIX installation.

### 4. Completion Screen
- Success checkmark banner.
- "Launch Zyra REPL Shell" option.
- "Finish" button.

---

## Implementation Architecture Options

### Option A: Native Windows Win32 API (Rust `windows-sys` / `winit` / `egui` crate)
- Single 100% self-contained standalone `.exe` binary without external dependencies.
- Zero extra installer runtime required.

### Option B: Inno Setup Script (`ZyraInstaller.iss`)
- Industry-standard Windows installer engine.
- Built-in GUI wizard pages, path selection, registry manipulation, shortcut creation, and automatic uninstaller generation.
