const vscode = require("vscode");
const { spawn } = require("child_process");
const path = require("path");

function activate(context) {
  // 1. Commands: Run, Build, Format, Test
  const runCommand = vscode.commands.registerCommand("zyra.run", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const document = editor.document;
    await document.save();

    const filePath = document.fileName;
    const terminal = vscode.window.createTerminal("Zyra Runner");
    terminal.show();
    terminal.sendText(`zyra run "${filePath}"`);
  });

  const buildCommand = vscode.commands.registerCommand("zyra.build", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const document = editor.document;
    await document.save();

    const filePath = document.fileName;
    const terminal = vscode.window.createTerminal("Zyra Compiler");
    terminal.show();
    terminal.sendText(`zyra build "${filePath}" --target rust --native`);
  });

  const fmtCommand = vscode.commands.registerCommand("zyra.fmt", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const document = editor.document;
    await document.save();

    const filePath = document.fileName;
    const terminal = vscode.window.createTerminal("Zyra Formatter");
    terminal.show();
    terminal.sendText(`zyra fmt "${filePath}"`);
  });

  const testCommand = vscode.commands.registerCommand("zyra.test", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const document = editor.document;
    await document.save();

    const filePath = document.fileName;
    const terminal = vscode.window.createTerminal("Zyra Tester");
    terminal.show();
    terminal.sendText(`zyra test "${filePath}"`);
  });

  // 2. Code Lens Provider (Run, Build, Test Buttons above def main() and @test)
  const codeLensProvider = vscode.languages.registerCodeLensProvider("zyra", {
    provideCodeLenses(document, token) {
      const lenses = [];
      const text = document.getText();
      const lines = text.split("\n");

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("def main")) {
          const range = new vscode.Range(i, 0, i, lines[i].length);
          lenses.push(
            new vscode.CodeLens(range, {
              title: "▶ Run Zyra Application",
              command: "zyra.run",
            }),
            new vscode.CodeLens(range, {
              title: "⚙ Build Native Binary",
              command: "zyra.build",
            })
          );
        } else if (lines[i].includes("@test")) {
          const range = new vscode.Range(i, 0, i, lines[i].length);
          lenses.push(
            new vscode.CodeLens(range, {
              title: "🧪 Run Unit Test",
              command: "zyra.test",
            })
          );
        }
      }
      return lenses;
    },
  });

  // 3. IntelliSense Autocompletion Provider
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    "zyra",
    {
      provideCompletionItems(document, position, token, context) {
        const items = [];

        const keywords = [
          "def", "async", "await", "trait", "impl", "struct", "enum", "const", "var", 
          "match", "if", "else", "try", "catch", "return", "import", "export", "extern", "print"
        ];
        keywords.forEach((kw) => {
          items.push(new vscode.CompletionItem(kw, vscode.CompletionItemKind.Keyword));
        });

        const types = ["Int", "String", "Boolean", "Float", "Option", "Result", "Some", "None", "Ok", "Err", "Void"];
        types.forEach((t) => {
          const item = new vscode.CompletionItem(t, vscode.CompletionItemKind.Class);
          item.detail = `Zyra Built-in Type ${t}`;
          items.push(item);
        });

        const stdlib = [
          { name: "std::http", detail: "REST client & requests", doc: "Non-blocking HTTP networking module." },
          { name: "std::json", detail: "JSON parsing & stringify", doc: "Fast JSON serialization module." },
          { name: "std::math", detail: "Math routines & random", doc: "Mathematical functions module." },
          { name: "std::time", detail: "Timestamps & timers", doc: "System timing module." },
          { name: "std::process", detail: "Process & env vars", doc: "System process management module." },
          { name: "std::regex", detail: "Pattern matching", doc: "Regular expression matching module." },
          { name: "std::str", detail: "String manipulation", doc: "Utf-8 string processing module." },
        ];

        stdlib.forEach((mod) => {
          const item = new vscode.CompletionItem(mod.name, vscode.CompletionItemKind.Module);
          item.detail = mod.detail;
          item.documentation = new vscode.MarkdownString(mod.doc);
          items.push(item);
        });

        return items;
      },
    }
  );

  // 4. Hover Documentation Provider
  const hoverProvider = vscode.languages.registerHoverProvider("zyra", {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position);
      if (!range) return null;
      const word = document.getText(range);

      const hovers = {
        Option: "**Option[T]**\n\nRepresenting optional value (`Some(T)` or `None`).",
        Result: "**Result[T, E]**\n\nRepresenting error handling (`Ok(T)` or `Err(E)`).",
        trait: "**trait**\n\nDefines a polymorphic interface contract.",
        impl: "**impl**\n\nImplements a trait interface for a struct.",
        async: "**async def**\n\nDefines a non-blocking asynchronous function.",
        await: "**await**\n\nSuspends execution until async task completes.",
      };

      if (hovers[word]) {
        return new vscode.Hover(new vscode.MarkdownString(hovers[word]));
      }
      return null;
    },
  });

  context.subscriptions.push(
    runCommand, 
    buildCommand, 
    fmtCommand, 
    testCommand, 
    codeLensProvider, 
    completionProvider, 
    hoverProvider
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
