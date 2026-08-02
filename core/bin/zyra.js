const __zyra_main = (() => {
  function print_help() {
    console.log(__zyra_fmt("=================================================="));
    console.log(__zyra_fmt("      Zyra Programming Language Compiler CLI     "));
    console.log(__zyra_fmt("=================================================="));
    console.log(__zyra_fmt("Usage: zyra <command> [options]"));
    console.log(__zyra_fmt("Commands:"));
    console.log(__zyra_fmt("  init <project-name>  Initialize a new Zyra project directory"));
    console.log(__zyra_fmt("  build <file.zy>      Compile Zyra file to native binary or JS"));
    console.log(__zyra_fmt("  run <file.zy>        Compile and run Zyra file in one step"));
    console.log(__zyra_fmt("  test                 Run test runner test_runner.zy"));
    console.log(__zyra_fmt("  repl                 Launch interactive terminal REPL shell"));
    console.log(__zyra_fmt("  version              Display version information"));
    console.log(__zyra_fmt("  help                 Show this help menu"));
    console.log(__zyra_fmt("Options:"));
    console.log(__zyra_fmt("  --target <rust|js>   Target output generator (default: rust)"));
    console.log(__zyra_fmt("  --native             Compile native executable binary via rustc"));
    console.log(__zyra_fmt("=================================================="));
    return 0;
  }
  function main() {
    console.log(__zyra_fmt("Self-Hosted Zyra Compiler CLI v1.0.1 successfully executed."));
    const _ = print_help();
    return 0;
  }
  const exit_code = main();
  return undefined;
})();
export default __zyra_main;
