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
  - **Smart VS Code Auto-Detection**:
    - Checks `%PATH%`, `%LocalAppData%\Programs\Microsoft VS Code`, and `%ProgramFiles%\Microsoft VS Code`.
    - If VS Code IS detected: `[x] Install Zyra Official VS Code Extension` (enabled by default).
    - If VS Code IS NOT detected: `[ ] Install Zyra Official VS Code Extension (VS Code not detected)` (disabled checkbox with tooltip/message: *"VS Code is not installed on this system. You can install the extension manually later via VSIX."*).
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
