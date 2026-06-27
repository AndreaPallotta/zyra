import {
  createConnection,
  TextDocuments,
  Diagnostic as LSPDiagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  Hover,
  Location,
  Range,
  HoverParams,
  DefinitionParams,
  TextDocumentChangeEvent
} from 'vscode-languageserver/node.js';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { lex, Parser, check, Span, Ty, ScopeEntry } from 'zyra-ts';

// Create a connection for the server, using Node's IPC as a transport.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      definitionProvider: true
    }
  };
});

// Cache for document information (usages, typeUsages, typeDeclarations, etc.)
interface DocumentCache {
  usages: Map<string, { name: string; ty: Ty; declSpan?: Span }>;
  typeUsages: Map<string, { name: string; ty: Ty; declSpan?: Span }>;
}

const cache = new Map<string, DocumentCache>();

// Helper to convert character index to 0-indexed line/character
class PositionConverter {
  private lineOffsets: number[];

  constructor(text: string) {
    const offsets = [0];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') {
        offsets.push(i + 1);
      }
    }
    this.lineOffsets = offsets;
  }

  positionAt(offset: number) {
    let low = 0;
    let high = this.lineOffsets.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.lineOffsets[mid] <= offset) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    const line = low - 1;
    return {
      line,
      character: offset - this.lineOffsets[line]
    };
  }

  rangeAt(start: number, end: number): Range {
    return {
      start: this.positionAt(start),
      end: this.positionAt(end)
    };
  }
}

// Function to format the type representation
function formatType(ty: Ty): string {
  if (!ty) return 'Unknown';
  switch (ty.kind) {
    case 'Int': return 'Int';
    case 'Bool': return 'Bool';
    case 'String': return 'String';
    case 'Unit': return 'Unit';
    case 'Any': return 'Any';
    case 'Unknown': return 'Unknown';
    case 'Struct': return `struct ${ty.name}`;
    case 'Enum': return `enum ${ty.name}`;
    case 'Fn': {
      const params = ty.params.map(formatType).join(', ');
      return `fn(${params}) -> ${formatType(ty.ret)}`;
    }
    default: return 'Unknown';
  }
}

documents.onDidChangeContent((change: TextDocumentChangeEvent<TextDocument>) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const diagnostics: LSPDiagnostic[] = [];
  const converter = new PositionConverter(text);

  const localUsages = new Map<string, { name: string; ty: Ty; declSpan?: Span }>();
  const localTypeUsages = new Map<string, { name: string; ty: Ty; declSpan?: Span }>();
  const typeDeclarations = new Map<string, Span>();

  try {
    const tokens = lex(text);
    const parser = new Parser(tokens);
    const program = parser.parseProgram();

    const checkDiags = check(program, {
      onDeclareIdentifier(name, entry, declSpan) {
        localUsages.set(`${declSpan.start}:${declSpan.end}`, { name, ty: entry.ty, declSpan });
      },
      onUseIdentifier(name, entry, useSpan) {
        localUsages.set(`${useSpan.start}:${useSpan.end}`, { name, ty: entry.ty, declSpan: entry.span });
      },
      onDeclareType(name, declSpan) {
        typeDeclarations.set(name, declSpan);
      },
      onUseType(name, ty, useSpan) {
        const declSpan = typeDeclarations.get(name);
        localTypeUsages.set(`${useSpan.start}:${useSpan.end}`, { name, ty, declSpan });
      }
    });

    for (const diag of checkDiags) {
      const range = diag.span
        ? converter.rangeAt(diag.span.start, diag.span.end)
        : Range.create(0, 0, 0, 0);

      diagnostics.push({
        severity: diag.level === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
        range,
        message: diag.message,
        source: 'zyra'
      });
    }

    cache.set(textDocument.uri, {
      usages: localUsages,
      typeUsages: localTypeUsages
    });

  } catch (err: any) {
    // Handle Lexer or Parser exceptions
    const span: Span | undefined = err.span;
    const range = span
      ? converter.rangeAt(span.start, span.end)
      : Range.create(0, 0, 0, 0);

    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range,
      message: err.message || 'Syntax Error',
      source: 'zyra'
    });
  }

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Find hovered identifier or type in cached usages
function findUsageAt(uri: string, offset: number) {
  const docCache = cache.get(uri);
  if (!docCache) return null;

  for (const [key, info] of docCache.usages.entries()) {
    const [startStr, endStr] = key.split(':');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (offset >= start && offset <= end) {
      return { ...info, isType: false };
    }
  }

  for (const [key, info] of docCache.typeUsages.entries()) {
    const [startStr, endStr] = key.split(':');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (offset >= start && offset <= end) {
      return { ...info, isType: true };
    }
  }

  return null;
}

connection.onHover((params: HoverParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const offset = document.offsetAt(params.position);
  const usage = findUsageAt(params.textDocument.uri, offset);
  if (!usage) return null;

  const typeStr = formatType(usage.ty);
  const contents = {
    kind: 'markdown' as const,
    value: [
      `**${usage.name}**`,
      `\`\`\`zyra`,
      usage.isType ? `type ${usage.name}` : `${usage.name}: ${typeStr}`,
      `\`\`\``
    ].join('\n')
  };

  return { contents };
});

connection.onDefinition((params: DefinitionParams): Location | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const offset = document.offsetAt(params.position);
  const usage = findUsageAt(params.textDocument.uri, offset);
  if (!usage || !usage.declSpan) return null;

  const text = document.getText();
  const converter = new PositionConverter(text);
  const range = converter.rangeAt(usage.declSpan.start, usage.declSpan.end);

  return {
    uri: params.textDocument.uri,
    range
  };
});

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();
