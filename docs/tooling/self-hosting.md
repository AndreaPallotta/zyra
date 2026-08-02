# Self-Hosted Compiler Architecture

The Zyra compiler is 100% self-hosted and written in pure Zyra.

---

## Compiler Pipeline

1. **`lexer.zy`**: Pure Zyra tokenizer emitting `Token` structures.
2. **`parser.zy`**: Pure Zyra recursive descent AST parser.
3. **`checker.zy`**: Semantic checker and diagnostic reporter.
4. **`zyra.zy`**: Entry point compiler CLI driver.
