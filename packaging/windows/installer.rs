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

const MB_OK: u32 = 0x00000000;
const MB_YESNO: u32 = 0x00000004;
const MB_ICONINFORMATION: u32 = 0x00000040;
const MB_ICONWARNING: u32 = 0x00000030;
const IDYES: i32 = 6;

fn show_msg_box(title: &str, message: &str, is_yesno: bool, is_warning: bool) -> bool {
    let w_title = to_wide(title);
    let w_message = to_wide(message);
    let mut flags = if is_warning { MB_ICONWARNING } else { MB_ICONINFORMATION };
    if is_yesno {
        flags |= MB_YESNO;
    } else {
        flags |= MB_OK;
    }
    let res = unsafe { MessageBoxW(ptr::null_mut(), w_message.as_ptr(), w_title.as_ptr(), flags) };
    res == IDYES
}

fn perform_installation(install_vscode: bool) -> Result<PathBuf, String> {
    let local_app_data = env::var("LOCALAPPDATA").map_err(|_| "LOCALAPPDATA environment variable not found.".to_string())?;
    let install_dir = PathBuf::from(local_app_data).join("Programs").join("Zyra").join("bin");

    fs::create_dir_all(&install_dir).map_err(|e| format!("Failed to create directory: {}", e))?;

    let target_exe = install_dir.join("zyra.exe");
    fs::write(&target_exe, ZYRA_BIN_BYTES).map_err(|e| format!("Failed to write zyra.exe: {}", e))?;

    // Update PATH
    let install_dir_str = install_dir.to_string_lossy();
    let ps_cmd = format!(
        "[Environment]::SetEnvironmentVariable('PATH', [Environment]::GetEnvironmentVariable('PATH', 'User') + ';{}', 'User')",
        install_dir_str
    );
    let _ = Command::new("powershell")
        .args(&["-NoProfile", "-Command", &ps_cmd])
        .output();

    if install_vscode {
        let temp_vsix = env::temp_dir().join("zyra-vscode-1.0.2.vsix");
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

    let mut prompt = String::from("Welcome to Zyra Programming Language Setup Wizard!\n\nThe installer will configure the following components:\n\n1. Zyra Core Compiler & Native CLI (zyra.exe)\n2. Windows User PATH Environment Variable Integration\n");

    if vscode_detected {
        prompt.push_str("3. Zyra Official VS Code Extension (Detected on system)\n\nWould you like to install the VS Code Extension as well?");
    } else {
        prompt.push_str("3. Zyra Official VS Code Extension (VS Code NOT detected)\n\nVS Code was not detected on this system. Would you like to proceed with installing Zyra Core Compiler?");
    }

    let user_agreed = show_msg_box(
        "Zyra Programming Language Setup",
        &prompt,
        true,
        !vscode_detected,
    );

    if !user_agreed && !vscode_detected {
        return;
    }

    let install_vscode = vscode_detected && user_agreed;

    match perform_installation(install_vscode) {
        Ok(dir) => {
            let success_msg = format!(
                "🎉 Installation Completed Successfully!\n\nInstalled binary: {}\nAdded to User PATH: {}\n\nOpen a new terminal and run 'zyra help' to get started!",
                dir.join("zyra.exe").display(),
                dir.display()
            );
            show_msg_box("Zyra Setup Complete", &success_msg, false, false);
        }
        Err(err) => {
            show_msg_box("Zyra Installation Error", &format!("Installation failed: {}", err), false, true);
        }
    }
}
