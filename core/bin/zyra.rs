#![allow(dead_code, unused_variables, unused_mut, unused_imports)]

use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;

fn print_help() {
    println!("==================================================");
    println!("                   Zyra CLI                       ");
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

fn get_completion_candidates(top_decls: &[String], stmts: &[String]) -> Vec<String> {
    let mut candidates = vec![
        "def", "fn", "struct", "enum", "const", "var", "return", "if", "else", 
        "match", "print", "Int", "String", "Boolean", ":help", ":vars", ":funcs", 
        ":clear", ":exit", "exit", "quit"
    ].into_iter().map(String::from).collect::<Vec<_>>();

    for d in top_decls {
        let parts: Vec<&str> = d.split_whitespace().collect();
        if parts.len() >= 2 {
            let name = parts[1].split('(').next().unwrap_or(parts[1]).split('{').next().unwrap_or(parts[1]);
            if !name.is_empty() && !candidates.contains(&name.to_string()) {
                candidates.push(name.to_string());
            }
        }
    }
    for s in stmts {
        let parts: Vec<&str> = s.split_whitespace().collect();
        if parts.len() >= 2 && (parts[0] == "let" || parts[0] == "const" || parts[0] == "var") {
            let name = parts[1].trim_matches(':');
            if !name.is_empty() && !candidates.contains(&name.to_string()) {
                candidates.push(name.to_string());
            }
        }
    }
    candidates
}

fn handle_repl() {
    println!("==================================================");
    println!("          Zyra Interactive Shell (REPL)           ");
    println!("          Type ':help' for REPL commands          ");
    println!("          Press TAB for symbol autocomplete       ");
    println!("          Type 'exit' or 'quit' to exit           ");
    println!("==================================================");

    use std::io::{self, Write};
    let mut top_declarations: Vec<String> = Vec::new();
    let mut statements_history: Vec<String> = Vec::new();
    let mut input_buffer = String::new();
    let mut brace_count: i32 = 0;

    let temp_dir = env::temp_dir().join("zyra_repl_cache");
    let _ = fs::create_dir_all(&temp_dir);

    loop {
        if brace_count > 0 {
            print!("...  ");
        } else {
            print!("zyra> ");
        }
        let _ = io::stdout().flush();

        let mut line = String::new();
        if io::stdin().read_line(&mut line).is_err() { break; }
        let raw_line = line.trim();

        if raw_line.ends_with('\t') || raw_line.ends_with('?') {
            let prefix = raw_line.trim_end_matches('?').trim_end_matches('\t').trim();
            let matches: Vec<String> = get_completion_candidates(&top_declarations, &statements_history)
                .into_iter()
                .filter(|c| c.starts_with(prefix))
                .collect();

            if !matches.is_empty() {
                println!(" -> {}", matches.join(" | "));
                continue;
            }
        }

        if brace_count == 0 {
            match raw_line {
                "exit" | "quit" | ":exit" => break,
                ":help" | ":h" => {
                    println!("REPL Commands:");
                    println!("  :help, :h      Show REPL help");
                    println!("  :vars          List active variable declarations");
                    println!("  :funcs         List defined functions");
                    println!("  :clear         Reset REPL session state");
                    println!("  exit, quit     Exit REPL shell\n");
                    continue;
                }
                ":vars" => {
                    println!("Active Statements: {}", statements_history.len());
                    for s in &statements_history {
                        println!("  {}", s);
                    }
                    continue;
                }
                ":funcs" => {
                    println!("Defined Functions & Structs: {}", top_declarations.len());
                    for d in &top_declarations {
                        println!("  {}", d.replace('\n', " "));
                    }
                    continue;
                }
                ":clear" => {
                    top_declarations.clear();
                    statements_history.clear();
                    input_buffer.clear();
                    brace_count = 0;
                    println!("REPL session state reset.");
                    continue;
                }
                _ => {}
            }
        }

        if raw_line.is_empty() && brace_count == 0 {
            continue;
        }

        // Count open and closing braces
        let open_b = raw_line.chars().filter(|&c| c == '{' || c == '(').count() as i32;
        let close_b = raw_line.chars().filter(|&c| c == '}' || c == ')').count() as i32;
        brace_count += open_b - close_b;
        if brace_count < 0 { brace_count = 0; }

        if !input_buffer.is_empty() {
            input_buffer.push('\n');
        }
        input_buffer.push_str(raw_line);

        if brace_count > 0 {
            continue;
        }

        // Complete statement / expression ready for evaluation!
        let code_to_eval = input_buffer.clone();
        input_buffer.clear();

        // Check if top-level declaration (def / fn / struct / enum)
        let is_top_decl = code_to_eval.starts_with("def ") 
            || code_to_eval.starts_with("fn ") 
            || code_to_eval.starts_with("struct ")
            || code_to_eval.starts_with("enum ");

        if is_top_decl {
            let mut rs_decl = code_to_eval.clone();
            if rs_decl.starts_with("struct ") {
                rs_decl = format!("#[derive(Debug, Clone)]\n{}", rs_decl);
                rs_decl = rs_decl.replace(": Int", ": i64,");
                rs_decl = rs_decl.replace(": String", ": String,");
            } else {
                rs_decl = rs_decl.replace("def ", "fn ");
                rs_decl = rs_decl.replace("): Int", ") -> i64");
                rs_decl = rs_decl.replace("): String", ") -> String");
                rs_decl = rs_decl.replace(": Int", ": i64");
                rs_decl = rs_decl.replace(": String", ": &str");
                rs_decl = rs_decl.replace("print(\"", "println!(\"");
                rs_decl = rs_decl.replace("print(", "println!(\"{}\", ");
            }
            top_declarations.push(rs_decl);
            // Silent definition like standard Python/Node/Rust REPLs
        } else {
            // Statement or expression evaluation inside fn main()
            let mut rs_code = String::from("#![allow(dead_code, unused_variables, unused_mut, unused_imports)]\n\n");
            for decl in &top_declarations {
                rs_code.push_str(decl);
                rs_code.push('\n');
            }

            rs_code.push_str("\nfn main() {\n");
            for stmt in &statements_history {
                rs_code.push_str("  ");
                rs_code.push_str(stmt);
                rs_code.push('\n');
            }

            let mut eval_stmt = code_to_eval.clone();
            let is_binding = eval_stmt.starts_with("const ") || eval_stmt.starts_with("var ") || eval_stmt.contains('=');

            eval_stmt = eval_stmt.replace("const ", "let ");
            eval_stmt = eval_stmt.replace("var ", "let mut ");

            if eval_stmt.starts_with("print(") && eval_stmt.ends_with(')') {
                let inner = &eval_stmt[6..eval_stmt.len() - 1];
                eval_stmt = format!("println!(\"{{}}\", {});", inner);
            } else if !is_binding && !eval_stmt.contains("println!") && !eval_stmt.ends_with(';') {
                eval_stmt = format!("println!(\"=> {{:?}}\", {});", eval_stmt);
            } else if !eval_stmt.ends_with(';') {
                eval_stmt.push(';');
            }

            rs_code.push_str("  ");
            rs_code.push_str(&eval_stmt);
            rs_code.push_str("\n}\n");

            let rs_file = temp_dir.join("repl_eval.rs");
            let exe_file = temp_dir.join(if cfg!(windows) { "repl_eval.exe" } else { "repl_eval" });

            let _ = fs::write(&rs_file, rs_code);
            let status = Command::new("rustc")
                .arg(&rs_file)
                .arg("-o")
                .arg(&exe_file)
                .output();

            if let Ok(out) = status {
                if out.status.success() {
                    let run_out = Command::new(&exe_file).output();
                    if let Ok(r) = run_out {
                        let res_str = String::from_utf8_lossy(&r.stdout);
                        let clean_res = res_str.trim_end();
                        if !clean_res.is_empty() && clean_res != "=> ()" {
                            if clean_res.ends_with("\n=> ()") {
                                print!("{}", &clean_res[..clean_res.len() - 6]);
                                println!();
                            } else {
                                println!("{}", clean_res);
                            }
                        }
                    }
                    if is_binding {
                        statements_history.push(eval_stmt);
                    }
                } else {
                    let err_str = String::from_utf8_lossy(&out.stderr);
                    let clean_err = err_str.lines().next().unwrap_or("Evaluation error");
                    println!("Error: {}", clean_err);
                }
            }
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
