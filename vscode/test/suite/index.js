"use strict";
const assert = require('assert');
const vscode = require('vscode');
suite('Extension Test Suite', () => {
    test('zyra.hello command should execute', async () => {
        await vscode.commands.executeCommand('zyra.hello');
        assert.ok(true);
    });
    test('opening sample file uses zyra language and completion includes let', async () => {
        const sample = vscode.Uri.file(require('path').resolve(__dirname, '..', '..', 'samples', 'hello-world', 'hello.zy'));
        const doc = await vscode.workspace.openTextDocument(sample);
        await vscode.window.showTextDocument(doc);
        // language association
        assert.strictEqual(doc.languageId, 'zyra');
        // request completions at line 0, column 1
        const items = await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', doc.uri, new vscode.Position(0, 1));
        const labels = (items && items.items) ? items.items.map((i) => i.label) : [];
        assert.ok(labels.includes('let'));
    });
});
//# sourceMappingURL=index.js.map