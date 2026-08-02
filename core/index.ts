/**
 * Zyra Programming Language - Core Compiler Architecture
 * 
 * Zyra is a 100% self-hosted programming language compiling to JavaScript ESM & Native Rust binaries.
 * Primary compiler modules written in Zyra:
 *  - zyra.zy    : Main compiler CLI driver
 *  - lexer.zy   : Self-hosted lexer & token stream processor
 *  - parser.zy  : Self-hosted recursive descent AST parser
 *  - checker.zy : Self-hosted semantic type checker
 */

export const ZYRA_SELF_HOSTED = true;
