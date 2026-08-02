#![allow(dead_code, unused_variables, unused_mut, unused_imports)]

fn print_help() -> i64 {
  println!("{}", String::from("=================================================="));
  println!("{}", String::from("      Zyra Programming Language Compiler CLI     "));
  println!("{}", String::from("=================================================="));
  println!("{}", String::from("Usage: zyra <command> [options]"));
  println!("{}", String::from("Commands:"));
  println!("{}", String::from("  init <project-name>  Initialize a new Zyra project directory"));
  println!("{}", String::from("  build <file.zy>      Compile Zyra file to native binary or JS"));
  println!("{}", String::from("  run <file.zy>        Compile and run Zyra file in one step"));
  println!("{}", String::from("  test                 Run test runner test_runner.zy"));
  println!("{}", String::from("  repl                 Launch interactive terminal REPL shell"));
  println!("{}", String::from("  version              Display version information"));
  println!("{}", String::from("  help                 Show this help menu"));
  println!("{}", String::from("Options:"));
  println!("{}", String::from("  --target <rust|js>   Target output generator (default: rust)"));
  println!("{}", String::from("  --native             Compile native executable binary via rustc"));
  println!("{}", String::from("=================================================="));
  return 0;
}

fn main() {
  println!("{}", String::from("Self-Hosted Zyra Compiler CLI v1.0.1 successfully executed."));
  let _ = print_help();
  std::process::exit(0 as i32);
}
