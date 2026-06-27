import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  console.log('Zyra language extension activated');

  // The server is implemented in Node
  const serverModule = context.asAbsolutePath(
    path.join('out', 'server.js')
  );

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    }
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for Zyra files
    documentSelector: [{ scheme: 'file', language: 'zyra' }],
    synchronize: {
      // Notify the server about file changes to '.zy' files contained in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.zy')
    }
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'zyraLanguageServer',
    'Zyra Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  // Keyword completions client side provider
  const KEYWORDS = [
    'let', 'const', 'fn', 'if', 'else', 'match', 'return', 'struct', 'enum', 'import', 'export'
  ];
  const TYPES = ['Int', 'Bool', 'String', 'Unit'];

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

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
