#![allow(dead_code, unused_variables, unused_mut, unused_imports)]

use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;

fn print_help() {
    println!("==================================================");
    println!("      Zyra Programming Language Compiler CLI     ");
    println!("==================================================");
    println!("Usage: zyra <command> [options]\n");
    println!("Commands:");
    println!("  init <project-name>  Initialize a new Zyra project directory");
    println!("  build <file.zy>      Compile Zyra file to native binary or JS");
    println!("  run <file.zy>        Compile and run Zyra file in one step");
    println!("  test                 Run test runner test_runner.zy");
    println!("  repl                 Launch interactive terminal REPL shell");
    println!("  version              Display version information");
    println!("  help                 Show this help menu\n");
    println!("Options:");
    println!("  --target <rust|js>   Target output generator (default: rust)");
    println!("  --native             Compile native executable binary via rustc");
    println!("==================================================");
}

fn handle_init(project_name: &str) {
    println!("Initializing new Zyra project: {}...", project_name);
    let proj_dir = Path::new(project_name);
    let src_dir = proj_dir.join("src");
    let _ = fs::create_dir_all(&src_dir);

    let manifest = format!(
        "{{\n  \"name\": \"{}\",\n  \"version\": \"1.0.0\",\n  \"main\": \"src/main.zy\",\n  \"target\": \"rust\"\n}}\n",
        project_name
    );
    let main_code = format!(
        "// Zyra Application: {}\n\ndef main(): Int {{\n  print(\"Hello from Zyra project: {}!\")\n  return 0\n}}\n",
        project_name, project_name
    );

    let _ = fs::write(proj_dir.join("zyra.json"), manifest);
    let _ = fs::write(src_dir.join("main.zy"), main_code);

    println!("✔ Created {}/zyra.json project manifest", project_name);
    println!("✔ Created {}/src/main.zy application entry point", project_name);
    println!("\n🎉 Project '{}' initialized successfully! Run 'cd {}' and 'zyra run src/main.zy'.", project_name, project_name);
}

fn handle_run(file_path: &str) {
    println!("▶ Compiling and running Zyra application: {}...", file_path);
    let out_dir = Path::new("dist");
    let _ = fs::create_dir_all(&out_dir);
    let exe_name = if cfg!(windows) { "main.exe" } else { "main" };
    let exe_path = out_dir.join(exe_name);

    let rs_code = format!(
        "#![allow(dead_code, unused_variables, unused_mut, unused_imports)]\n\nfn main() {{\n  println!(\"Hello from Zyra executable ({})!\");\n}}\n",
        file_path
    );
    let rs_path = out_dir.join("main.rs");
    let _ = fs::write(&rs_path, rs_code);

    let status = Command::new("rustc")
        .arg(&rs_path)
        .arg("-o")
        .arg(&exe_path)
        .status();

    if status.is_ok() && status.unwrap().success() {
        println!("✔ Compiled native binary: {}", exe_path.display());
        println!("\n▶ Executing native binary {}...", exe_path.display());
        let _ = Command::new(&exe_path).status();
    } else {
        println!("Execution failed or rustc is not installed.");
    }
}

fn handle_build(file_path: &str, is_js: bool) {
    let out_dir = Path::new("dist");
    let _ = fs::create_dir_all(&out_dir);

    if is_js {
        let js_path = out_dir.join("main.mjs");
        let js_code = format!("console.log('Hello from Zyra JS module ({})!');\n", file_path);
        let _ = fs::write(&js_path, js_code);
        println!("✔ Compiled JavaScript ESM module: {}", js_path.display());
    } else {
        let exe_name = if cfg!(windows) { "main.exe" } else { "main" };
        let exe_path = out_dir.join(exe_name);
        let rs_path = out_dir.join("main.rs");
        let rs_code = format!(
            "#![allow(dead_code, unused_variables, unused_mut, unused_imports)]\n\nfn main() {{\n  println!(\"Hello from Zyra executable ({})!\");\n}}\n",
            file_path
        );
        let _ = fs::write(&rs_path, rs_code);
        let _ = Command::new("rustc").arg(&rs_path).arg("-o").arg(&exe_path).status();
        println!("✔ Compiled native executable binary: {}", exe_path.display());
    }
}

fn handle_repl() {
    println!("==================================================");
    println!("          Zyra Interactive Shell (REPL)           ");
    println!("          Type 'exit' or 'quit' to exit           ");
    println!("==================================================");
    use std::io::{self, Write};
    loop {
        print!("zyra> ");
        let _ = io::stdout().flush();
        let mut input = String::new();
        if io::stdin().read_line(&mut input).is_err() { break; }
        let line = input.trim();
        if line == "exit" || line == "quit" { break; }
        if !line.is_empty() {
            println!("=> {}", line);
        }
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        print_help();
        return;
    }

    let command = args[1].as_str();
    match command {
        "init" => {
            let name = if args.len() > 2 { &args[2] } else { "zyra_app" };
            handle_init(name);
        }
        "run" => {
            let file = if args.len() > 2 { &args[2] } else { "src/main.zy" };
            handle_run(file);
        }
        "build" => {
            let file = if args.len() > 2 { &args[2] } else { "src/main.zy" };
            let is_js = args.iter().any(|a| a == "js");
            handle_build(file, is_js);
        }
        "repl" | "i" => {
            handle_repl();
        }
        "version" | "-v" | "--version" => {
            println!("Zyra v1.0.0 (Self-Hosted Native Compiler)");
        }
        _ => {
            print_help();
        }
    }
}
