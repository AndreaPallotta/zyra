#![windows_subsystem = "windows"]

use std::env;
use std::fs;
use std::os::windows::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::ptr;

const ZYRA_BIN_BYTES: &[u8] = include_bytes!("../../core/bin/zyra.exe");
const VSIX_BYTES: &[u8] = include_bytes!("../../dist_packages/zyra-vscode-1.0.2.vsix");

fn to_wide(s: &str) -> Vec<u16> {
    std::ffi::OsStr::new(s).encode_wide().chain(Some(0)).collect()
}

fn is_vscode_installed() -> bool {
    if Command::new("code").arg("--version").output().is_ok() {
        return true;
    }
    if let Ok(appdata) = env::var("LOCALAPPDATA") {
        let code_path = Path::new(&appdata).join("Programs").join("Microsoft VS Code").join("Code.exe");
        if code_path.exists() {
            return true;
        }
    }
    if let Ok(programfiles) = env::var("ProgramFiles") {
        let code_path = Path::new(&programfiles).join("Microsoft VS Code").join("Code.exe");
        if code_path.exists() {
            return true;
        }
    }
    false
}

#[link(name = "user32")]
extern "system" {
    fn MessageBoxW(
        hwnd: *mut std::ffi::c_void,
        text: *const u16,
        caption: *const u16,
        utype: u32,
    ) -> i32;
}

const MB_YESNOCANCEL: u32 = 0x00000003;
const MB_OK: u32 = 0x00000000;
const MB_ICONINFORMATION: u32 = 0x00000040;
const MB_ICONWARNING: u32 = 0x00000030;

const IDYES: i32 = 6;
const IDNO: i32 = 7;

fn perform_installation(install_vscode: bool) -> Result<PathBuf, String> {
    let local_app_data = env::var("LOCALAPPDATA").map_err(|_| "LOCALAPPDATA environment variable not found.".to_string())?;
    let install_dir = PathBuf::from(local_app_data).join("Programs").join("Zyra").join("bin");

    fs::create_dir_all(&install_dir).map_err(|e| format!("Failed to create directory: {}", e))?;

    let target_exe = install_dir.join("zyra.exe");
    fs::write(&target_exe, ZYRA_BIN_BYTES).map_err(|e| format!("Failed to write zyra.exe: {}", e))?;

    // Update PATH cleanly (only if not already present in User PATH)
    let install_dir_str = install_dir.to_string_lossy();
    let ps_cmd = format!(
        "$cur = [Environment]::GetEnvironmentVariable('PATH', 'User'); if (-not $cur.Contains('{}')) {{ [Environment]::SetEnvironmentVariable('PATH', $cur + ';{}', 'User') }}",
        install_dir_str, install_dir_str
    );
    let _ = Command::new("powershell")
        .args(&["-NoProfile", "-Command", &ps_cmd])
        .output();

    if install_vscode {
        let temp_vsix = env::temp_dir().join("zyra-vscode.vsix");
        if fs::write(&temp_vsix, VSIX_BYTES).is_ok() {
            let _ = Command::new("code")
                .args(&["--install-extension", &temp_vsix.to_string_lossy(), "--force"])
                .output();
            let _ = fs::remove_file(temp_vsix);
        }
    }

    Ok(install_dir)
}

fn main() {
    let vscode_detected = is_vscode_installed();

    let default_install_path = match env::var("LOCALAPPDATA") {
        Ok(v) => format!("{}\\Programs\\Zyra\\bin", v),
        Err(_) => String::from("C:\\Users\\Public\\Zyra\\bin"),
    };

    let title_w = to_wide("Zyra Programming Language Setup Wizard");

    // Wizard Step 1: Welcome Page
    let welcome_text = format!(
        "Welcome to the Zyra Setup Wizard\n\nThis wizard will install the Zyra Programming Language v1.0.0 on your computer.\n\nDestination Path:\n  {}\n\nPress YES to proceed with Component Selection, or CANCEL to exit.",
        default_install_path
    );
    let welcome_w = to_wide(&welcome_text);

    let res1 = unsafe {
        MessageBoxW(
            ptr::null_mut(),
            welcome_w.as_ptr(),
            title_w.as_ptr(),
            MB_YESNOCANCEL | MB_ICONINFORMATION,
        )
    };

    if res1 != IDYES && res1 != IDNO {
        return;
    }

    // Wizard Step 2: Component Options Page
    let vscode_status = if vscode_detected {
        "✔ Microsoft VS Code detected on system"
    } else {
        "ℹ VS Code not detected on PATH (Extension can be installed manually later via VSIX)"
    };

    let comp_text = format!(
        "Select Installation Components:\n\nComponents:\n  [✓] 1. Zyra Core Compiler & Native Executable (zyra.exe)\n  [✓] 2. Add Zyra to Windows User PATH\n  [?] 3. Install Zyra Official VS Code Extension\n\n{}\n\n[YES] Install Full Zyra Toolchain & VS Code Extension\n[NO] Install Zyra CLI Only (Skip VS Code Extension)\n[CANCEL] Exit Setup",
        vscode_status
    );
    let comp_w = to_wide(&comp_text);

    let res2 = unsafe {
        MessageBoxW(
            ptr::null_mut(),
            comp_w.as_ptr(),
            title_w.as_ptr(),
            MB_YESNOCANCEL | MB_ICONINFORMATION,
        )
    };

    if res2 != IDYES && res2 != IDNO {
        return;
    }

    let install_vscode = (res2 == IDYES) && vscode_detected;

    // Wizard Step 3: Installation & Completion Page
    match perform_installation(install_vscode) {
        Ok(dir) => {
            let finish_text = format!(
                "Completing the Zyra Setup Wizard!\n\n🎉 Zyra Programming Language v1.0.0 installed successfully!\n\nInstalled Location: {}\nPATH: Added to User Environment Variables\nVS Code Extension: {}\n\nPress OK to finish setup and launch a new terminal to start using Zyra!",
                dir.join("zyra.exe").display(),
                if install_vscode { "Installed" } else { "Skipped" }
            );
            let finish_w = to_wide(&finish_text);
            unsafe {
                MessageBoxW(
                    ptr::null_mut(),
                    finish_w.as_ptr(),
                    title_w.as_ptr(),
                    MB_OK | MB_ICONINFORMATION,
                );
            }
        }
        Err(err) => {
            let err_msg = format!("Installation failed: {}", err);
            let err_w = to_wide(&err_msg);
            unsafe {
                MessageBoxW(
                    ptr::null_mut(),
                    err_w.as_ptr(),
                    title_w.as_ptr(),
                    MB_OK | MB_ICONWARNING,
                );
            }
        }
    }
}
