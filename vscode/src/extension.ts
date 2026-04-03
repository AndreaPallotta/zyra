import * as vscode from 'vscode';

const KEYWORDS = [
  'let', 'const', 'fn', 'if', 'else', 'match', 'return', 'struct', 'enum', 'import', 'export'
];
const TYPES = ['Int', 'Bool', 'String', 'Unit'];

export function activate(context: any) {
  console.log('Zyra language extension activated');

  const provider = vscode.languages.registerCompletionItemProvider(
    { language: 'zyra', scheme: 'file' },
    {
      provideCompletionItems() {
        const items: any[] = [];
        for (const kw of KEYWORDS) items.push({ label: kw, kind: 14 /* Keyword */ });
        for (const t of TYPES) items.push({ label: t, kind: 11 /* Type */ });
        return items;
      }
    },
    ...[' ']
  );

  const disposable = vscode.commands.registerCommand('zyra.hello', () => {
    vscode.window.showInformationMessage('Zyra extension is active');
  });

  context.subscriptions.push(provider, disposable);
}

export function deactivate() {}
