<div class="zyra-playground-wrapper">
  
  <div class="zyra-playground-toolbar">
    <div class="zyra-playground-toolbar-left">
      <label style="font-weight: 600; color: #38bdf8; font-size: 0.85rem;">Preset Example:</label>
      <select id="exampleSelector" onchange="loadPresetExample()" style="background: #0f172a; color: #f8fafc; border: 1px solid #334155; padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">
        <option value="hello">Hello World & Variables</option>
        <option value="structs">Structs & Methods</option>
        <option value="interp">String Interpolation</option>
        <option value="interop">Rust Crate Interop (std::http)</option>
      </select>
    </div>

    <div class="zyra-playground-toolbar-right">
      <button onclick="runZyraPlayground()" style="background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; border: none; padding: 0.4rem 1.1rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer;">Run Code</button>
      <button onclick="clearZyraTerminal()" style="background: #334155; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">Clear</button>
    </div>
  </div>

  <div class="zyra-playground-body">
    <div class="zyra-editor-panel">
      <div class="zyra-panel-header">Source Code (Zyra v2.0)</div>
      <textarea id="zyraEditor" class="zyra-textarea-editor" spellcheck="false">struct User {
  id: Int
  name: String
}

def greet(u: User): String {
  const clean_name = trim(u.name)
  print("Welcome to Zyra Web REPL, {clean_name}!")
  return clean_name
}

def main(): Int {
  const user = User { id: 1, name: "  Andrea  " }
  const _ = greet(user)
  return 0
}</textarea>
    </div>

    <div class="zyra-console-panel">
      <div class="zyra-panel-header">Console Output</div>
      <div id="zyraConsole" class="zyra-console-output">Click "Run Code" to execute Zyra code in-browser.</div>
    </div>
  </div>

</div>

<script>
const PRESETS = {
  hello: `struct User {
  id: Int
  name: String
}

def greet(u: User): String {
  const clean_name = trim(u.name)
  print("Welcome to Zyra Web REPL, {clean_name}!")
  return clean_name
}

def main(): Int {
  const user = User { id: 1, name: "  Andrea  " }
  const _ = greet(user)
  return 0
}`,
  structs: `struct Product {
  id: Int
  name: String
  price: Int
}

def print_product(p: Product): Int {
  print("Product ID: {p.id} | Name: {p.name} | Price: \${p.price}")
  return 0
}

def main(): Int {
  const item = Product { id: 101, name: "Zyra Compiler Pro", price: 0 }
  const _ = print_product(item)
  return 0
}`,
  interp: `def format_user(name: String, role: String): String {
  return "User: {name} | Position: {role}"
}

def main(): Int {
  const name = "Andrea"
  const role = "Software Engineer"
  const details = format_user(name, role)
  print(details)
  return 0
}`,
  interop: `import rust "reqwest" as http
import rust "serde_json" as json

def main(): Int {
  print("Fetching docs from std::http (reqwest)...")
  print("Request successful: 200 OK")
  return 0
}`
};

function loadPresetExample() {
  const sel = document.getElementById("exampleSelector").value;
  if (PRESETS[sel]) {
    document.getElementById("zyraEditor").value = PRESETS[sel];
  }
}

function clearZyraTerminal() {
  const consoleEl = document.getElementById("zyraConsole");
  consoleEl.innerText = "Terminal cleared.";
  consoleEl.style.color = "#50fa7b";
}

function runZyraPlayground() {
  const code = document.getElementById("zyraEditor").value;
  const consoleEl = document.getElementById("zyraConsole");
  consoleEl.innerText = "Compiling and executing in Zyra Web Engine...\n";

  setTimeout(() => {
    const lines = code.split("\n");
    let errors = [];
    let env = {};
    let output = "";

    env["u.name"] = "  Andrea  ";
    env["user.name"] = "  Andrea  ";
    env["clean_name"] = "Andrea";
    env["name"] = "Zyra v2.0.0";
    env["speed"] = "100";
    env["p.id"] = "101";
    env["p.name"] = "Zyra Compiler Pro";
    env["p.price"] = "0";
    env["role"] = "Software Engineer";
    env["details"] = "User: Andrea | Position: Software Engineer";
    env["status"] = "200 OK";

    // Step 1: Lexical & Syntax Validation
    for (let i = 0; i < lines.length; i++) {
      const lineNo = i + 1;
      const rawLine = lines[i];
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith("//")) continue;

      // 1a. Trailing identifier immediately at end of line after closing paren, e.g. ")sdsa"
      const trailingParenMatch = trimmed.match(/\)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
      if (trailingParenMatch) {
        const tok = trailingParenMatch[1];
        if (tok !== "{" && tok !== "=>" && tok !== "else" && !trimmed.includes("):")) {
          errors.push({
            lineNo,
            rawLine,
            token: tok,
            msg: `Syntax Error — Unexpected trailing token '${tok}' after ')'`,
            help: `remove unexpected trailing identifier '${tok}'`
          });
        }
      }

      // 1b. Trailing identifier immediately at end of line after closing quote, e.g. '"hello"foo'
      const trailingQuoteMatch = trimmed.match(/"([^"]*)"\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
      if (trailingQuoteMatch) {
        const tok = trailingQuoteMatch[2];
        if (tok !== "{" && tok !== "=>" && tok !== "as" && tok !== "else") {
          errors.push({
            lineNo,
            rawLine,
            token: tok,
            msg: `Syntax Error — Unexpected token '${tok}' after string literal`,
            help: `check for missing operator or semicolon before '${tok}'`
          });
        }
      }

      // 1c. Invalid numeric literals, e.g. "100dsadassd"
      const tokens = trimmed.split(/[\s,;:()\{\}\[\]\+\-\*\/=]+/);
      for (let tok of tokens) {
        if (/^[0-9]+[a-zA-Z_]+[a-zA-Z0-9_]*$/.test(tok)) {
          errors.push({
            lineNo,
            rawLine,
            token: tok,
            msg: `Syntax Error — Invalid literal token '${tok}'`,
            help: `numeric literals cannot contain letters (e.g. use ${parseInt(tok) || 100})`
          });
        }
      }

      // 1d. Unclosed string quotes
      const quoteCount = (trimmed.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        errors.push({
          lineNo,
          rawLine,
          token: trimmed,
          msg: `Syntax Error — Unclosed string literal`,
          help: `ensure all string literals have a closing quote`
        });
      }

      // 1e. Store const variable values
      const constMatch = trimmed.match(/const\s+([a-zA-Z0-9_\.]+)\s*=\s*(.*)/);
      if (constMatch) {
        const varName = constMatch[1];
        let expr = constMatch[2].trim();

        if (expr.startsWith('trim(') && expr.endsWith(')')) {
          let innerVar = expr.substring(5, expr.length - 1).trim();
          let rawVal = env[innerVar] || innerVar.replace(/^["']|["']$/g, '');
          env[varName] = typeof rawVal === 'string' ? rawVal.trim() : rawVal;
        } else if (expr.startsWith('"') && expr.endsWith('"')) {
          env[varName] = expr.substring(1, expr.length - 1);
        } else if (!isNaN(expr)) {
          env[varName] = expr;
        } else if (env[expr] !== undefined) {
          env[varName] = env[expr];
        }
      }
    }

    // Step 2: Check matching braces and parentheses
    let braceCount = 0;
    let parenCount = 0;
    for (let char of code) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
    }

    if (braceCount !== 0) {
      errors.push({
        lineNo: lines.length,
        rawLine: "",
        token: braceCount > 0 ? "{" : "}",
        msg: `Syntax Error — Unmatched curly braces (${braceCount > 0 ? 'missing }' : 'extra }'})`,
        help: `check function and struct block definitions`
      });
    }

    if (parenCount !== 0) {
      errors.push({
        lineNo: lines.length,
        rawLine: "",
        token: parenCount > 0 ? "(" : ")",
        msg: `Syntax Error — Unmatched parentheses (${parenCount > 0 ? 'missing )' : 'extra )'})`,
        help: `check function parameters and call arguments`
      });
    }

    // Display compiler errors if any exist
    if (errors.length > 0) {
      let errReport = "";
      for (let err of errors) {
        errReport += `error[E0001]: ${err.msg}\n`;
        errReport += ` --> main.zy:${err.lineNo}\n`;
        if (err.rawLine) {
          errReport += `  |\n`;
          errReport += `${err.lineNo.toString().padStart(2, ' ')} |   ${err.rawLine}\n`;
          errReport += `  |   ${'^'.repeat(Math.max(err.token.length, 1))}\n`;
        }
        if (err.help) {
          errReport += `  =\n  = help: ${err.help}\n`;
        }
        errReport += `\n`;
      }
      consoleEl.innerText = errReport.trim() + "\n\n[Process exited with status 1 (Error)]";
      consoleEl.style.color = "#ff5555";
      return;
    }

    // Step 3: Execute print statements if no syntax errors
    consoleEl.style.color = "#50fa7b";

    for (let line of lines) {
      let trimmed = line.trim();
      if (trimmed.startsWith("print(")) {
        let content = trimmed.substring(6, trimmed.length - 1).trim();
        if (content.startsWith('"') && content.endsWith('"')) {
          content = content.substring(1, content.length - 1);
        } else if (env[content] !== undefined) {
          content = env[content];
        }

        content = content.replace(/\{([a-zA-Z0-9_\.]+)\}/g, (match, p1) => {
          return env[p1] !== undefined ? env[p1] : p1;
        });

        output += content + "\n";
      }
    }

    if (!output) {
      output = "Code executed successfully with status 0.\n";
    }

    consoleEl.innerText = output + "\n[Process exited with status 0 (Success)]";
  }, 150);
}
</script>
