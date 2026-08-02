use std::env;
use std::fs;
use std::io::{self, Write};
use std::path::PathBuf;
use std::process::Command;

const ZYRA_BIN_BYTES: &[u8] = include_bytes!("../../core/bin/zyra.exe");
const VSIX_BYTES: &[u8] = include_bytes!("../../dist_packages/zyra-vscode-1.0.2.vsix");

fn main() {
    println!("==================================================");
    println!("          Zyra Programming Language Setup         ");
    println!("==================================================");
    println!("\nSelect optional components to install:\n");
    println!("  [✓] 1. Zyra Core Compiler & Native CLI (zyra.exe)");

    print!("  [?] 2. Install Zyra VS Code Extension? (Y/n): ");
    let _ = io::stdout().flush();

    let mut input = String::new();
    let _ = io::stdin().read_line(&mut input);
    let install_vscode = !input.trim().eq_ignore_ascii_case("n");

    println!("\nInstalling Zyra...");

    let local_app_data = match env::var("LOCALAPPDATA") {
        Ok(val) => PathBuf::from(val),
        Err(_) => {
            eprintln!("Error: LOCALAPPDATA environment variable not found.");
            std::process::exit(1);
        }
    };

    let install_dir = local_app_data.join("Programs").join("Zyra").join("bin");
    if let Err(e) = fs::create_dir_all(&install_dir) {
        eprintln!("Failed to create installation directory: {}", e);
        std::process::exit(1);
    }

    let target_exe = install_dir.join("zyra.exe");
    if let Err(e) = fs::write(&target_exe, ZYRA_BIN_BYTES) {
        eprintln!("Failed to write zyra.exe binary: {}", e);
        std::process::exit(1);
    }

    println!("✔ Installed zyra.exe -> {}", target_exe.display());

    let install_dir_str = install_dir.to_string_lossy();
    let ps_cmd = format!(
        "[Environment]::SetEnvironmentVariable('PATH', [Environment]::GetEnvironmentVariable('PATH', 'User') + ';{}', 'User')",
        install_dir_str
    );

    let _ = Command::new("powershell")
        .args(&["-NoProfile", "-Command", &ps_cmd])
        .output();

    println!("✔ Added {} to Windows PATH!", install_dir.display());

    if install_vscode {
        let temp_vsix = env::temp_dir().join("zyra-vscode.vsix");
        if fs::write(&temp_vsix, VSIX_BYTES).is_ok() {
            println!("✔ Extracting VS Code Extension VSIX...");
            let res = Command::new("code")
                .args(&["--install-extension", &temp_vsix.to_string_lossy()])
                .output();

            match res {
                Ok(out) if out.status.success() => {
                    println!("✔ Successfully installed Zyra VS Code Extension!");
                }
                _ => {
                    println!("ℹ VS Code ('code') not found on PATH. You can manually install later with:");
                    println!("  code --install-extension dist_packages/zyra-vscode-1.0.0.vsix");
                }
            }
            let _ = fs::remove_file(temp_vsix);
        }
    }

    println!("==================================================");
    println!("🎉 Installation Complete! Open a new terminal and run 'zyra --help'.");
    println!("==================================================");
}
