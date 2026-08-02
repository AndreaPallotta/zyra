const vscode = require("vscode");
const { execSync } = require("child_process");
const path = require("path");

function activate(context) {
  // 1. Commands: Run and Build Zyra Files
  const runCommand = vscode.commands.registerCommand("zyra.run", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const document = editor.document;
    await document.save();

    const filePath = document.fileName;
    const terminal = vscode.window.createTerminal("Zyra Runner");
    terminal.show();
    terminal.sendText(`zyra build "${filePath}" --target rust --native`);
  });

  const buildCommand = vscode.commands.registerCommand("zyra.build", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const document = editor.document;
    await document.save();

    const filePath = document.fileName;
    const terminal = vscode.window.createTerminal("Zyra Compiler");
    terminal.show();
    terminal.sendText(`zyra build "${filePath}" --target js`);
  });

  // 2. Code Lens Provider (Run & Build Buttons above def main())
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
              title: "▶ Run Native Zyra Binary",
              command: "zyra.run",
            }),
            new vscode.CodeLens(range, {
              title: "⚙ Build JS Target",
              command: "zyra.build",
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

        const keywords = ["def", "struct", "enum", "const", "var", "match", "if", "else", "return", "import", "export", "from", "print"];
        keywords.forEach((kw) => {
          items.push(new vscode.CompletionItem(kw, vscode.CompletionItemKind.Keyword));
        });

        const types = ["Int", "String", "Bool", "BigInt", "Void"];
        types.forEach((t) => {
          const item = new vscode.CompletionItem(t, vscode.CompletionItemKind.Class);
          item.detail = `Zyra Built-in Type ${t}`;
          items.push(item);
        });

        const stdlib = [
          { name: "len", detail: "(s: String): Int", doc: "Returns the length of string `s`." },
          { name: "substr", detail: "(s: String, start: Int, len: Int): String", doc: "Returns a substring of `s` starting at index `start`." },
          { name: "trim", detail: "(s: String): String", doc: "Removes leading and trailing whitespace from string `s`." },
          { name: "contains", detail: "(s: String, sub: String): Bool", doc: "Returns `true` if `s` contains `sub`." },
          { name: "file_read", detail: "(path: String): String", doc: "Reads text contents of file at `path`." },
          { name: "file_write", detail: "(path: String, content: String): Bool", doc: "Writes `content` string to file at `path`." },
          { name: "str", detail: "(val: Int): String", doc: "Converts integer `val` to string." },
          { name: "parse_int", detail: "(s: String): Int", doc: "Parses integer value from string `s`." },
        ];

        stdlib.forEach((fn) => {
          const item = new vscode.CompletionItem(fn.name, vscode.CompletionItemKind.Function);
          item.detail = fn.detail;
          item.documentation = new vscode.MarkdownString(fn.doc);
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
        len: "**len**(s: String): Int\n\nReturns string length.",
        substr: "**substr**(s: String, start: Int, len: Int): String\n\nExtracts substring.",
        trim: "**trim**(s: String): String\n\nTrims whitespace.",
        contains: "**contains**(s: String, sub: String): Bool\n\nSubstring search.",
        file_read: "**file_read**(path: String): String\n\nReads file contents.",
        file_write: "**file_write**(path: String, content: String): Bool\n\nWrites file contents.",
        str: "**str**(val: Int): String\n\nConverts Int to String.",
        parse_int: "**parse_int**(s: String): Int\n\nParses Int from String.",
      };

      if (hovers[word]) {
        return new vscode.Hover(new vscode.MarkdownString(hovers[word]));
      }
      return null;
    },
  });

  context.subscriptions.push(runCommand, buildCommand, codeLensProvider, completionProvider, hoverProvider);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
