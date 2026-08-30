# Codebase Map
Generated: 2026-08-29 23:04:59
Commit: f47b018 feat(stdlib): add microbenchmark harness, coverage html, streaming io, and linear algebra

This file is a compact index of the codebase for AI agents to understand project structure without full recursive file scans.

## External & Linked Dependencies
See [DEPS.md](file:///c:/Users/andre/OneDrive/Desktop/projects/agent-devkit/DEPS.md) for runtime environment and linked package maps.

## File Index
- **.github/workflows/ci.yml** (67 lines)
- **.github/workflows/deploy-docs.yml** (67 lines)
- **.github/workflows/release.yml** (135 lines)
- **.vscode/copilot-instructions.md** (84 lines)
- **AGENT.md** (33 lines)
- **CHANGELOG.md** (188 lines)
- **CLAUDE.md** (30 lines)
- **CODEBASE.md** (408 lines)
- **core/bin/zyra.js** (30 lines)
- **core/bin/zyra.rs** (5353 lines)
- **core/coverage/lcov-report/block-navigation.js** (88 lines)
- **core/coverage/lcov-report/prettify.js** (3 lines)
- **core/coverage/lcov-report/sorter.js** (211 lines)
- **core/coverage/tmp/coverage-17166-1773612301114-0.json** (1 lines)
- **core/coverage/tmp/coverage-17167-1773612299631-0.json** (1 lines)
- **core/coverage/tmp/coverage-17185-1773612301095-0.json** (1 lines)
- **core/coverage/tmp/coverage-17196-1773612301047-1.json** (1 lines)
- **core/coverage/tmp/coverage-17196-1773612301065-0.json** (1 lines)
- **core/index.ts** (13 lines)
- **core/lib/logger.ts** (24 lines)
- **core/package.json** (49 lines)
- **core/package-lock.json** (1699 lines)
- **core/README.md** (41 lines)
- **core/repl_spec.md** (40 lines)
- **core/test/branch_targets_final_push.test.ts** (94 lines)
- **core/test/branch_targets_more.test.ts** (97 lines)
- **core/test/comprehensive.test.ts** (78 lines)
- **core/test/core_helpers.combined.test.ts** (129 lines)
- **core/test/cover_struct_enum_and_match_more.test.ts** (77 lines)
- **core/test/enum.test.ts** (78 lines)
- **core/test/env.combined.test.ts** (80 lines)
- **core/test/expr.combined.test.ts** (738 lines)
- **core/test/helpers.test.ts** (50 lines)
- **core/test/match.combined.test.ts** (414 lines)
- **core/test/merged_small_tests.test.ts** (293 lines)
- **core/test/run-all.ts** (25 lines)
- **core/test/run-all-internal-imports.js** (43 lines)
- **core/test/rust_printer.test.ts** (73 lines)
- **core/test/self_host_full.test.ts** (47 lines)
- **core/test/self_host_lexer.test.ts** (56 lines)
- **core/test/self_host_parser.test.ts** (57 lines)
- **core/test/stdlib.test.ts** (45 lines)
- **core/test/stmts.combined.test.ts** (351 lines)
- **core/test/stmts_struct_enum_decl.test.ts** (39 lines)
- **core/test/stmts_unreachable_more.test.ts** (44 lines)
- **core/test/struct.test.ts** (83 lines)
- **core/test/targeted_branch_coverage.test.ts** (129 lines)
- **core/test/unreachable.test.ts** (43 lines)
- **core/tsconfig.json** (15 lines)
- **DECISIONS.md** (28 lines)
- **DEPS.md** (30 lines)
- **dist_packages/conda-recipe/build.sh** (5 lines)
- **dist_packages/conda-recipe/meta.yaml** (36 lines)
- **dist_packages/get.sh** (59 lines)
- **docs/api/API_DOCUMENTATION.md** (15 lines)
- **docs/getting-started/installation.md** (49 lines)
- **docs/getting-started/quickstart.md** (60 lines)
- **docs/index.md** (84 lines)
- **docs/language/control-flow.md** (147 lines)
- **docs/language/functions-modules.md** (135 lines)
- **docs/language/stdlib/chan.md** (48 lines)
- **docs/language/stdlib/crypto.md** (75 lines)
- **docs/language/stdlib/db.md** (44 lines)
- **docs/language/stdlib/env.md** (64 lines)
- **docs/language/stdlib/http.md** (52 lines)
- **docs/language/stdlib/index.md** (59 lines)
- **docs/language/stdlib/io.md** (80 lines)
- **docs/language/stdlib/json.md** (70 lines)
- **docs/language/stdlib/log.md** (62 lines)
- **docs/language/stdlib/map.md** (47 lines)
- **docs/language/stdlib/math.md** (100 lines)
- **docs/language/stdlib/path.md** (49 lines)
- **docs/language/stdlib/pool.md** (40 lines)
- **docs/language/stdlib/process.md** (26 lines)
- **docs/language/stdlib/regex.md** (43 lines)
- **docs/language/stdlib/str.md** (43 lines)
- **docs/language/stdlib/time.md** (59 lines)
- **docs/language/stdlib/url.md** (36 lines)
- **docs/language/stdlib/vec.md** (56 lines)
- **docs/language/stdlib/ws.md** (37 lines)
- **docs/language/structs-enums.md** (138 lines)
- **docs/language/traits-generics.md** (107 lines)
- **docs/language/variables-types.md** (112 lines)
- **docs/play.md** (303 lines)
- **docs/releases.md** (175 lines)
- **docs/tooling/cli.md** (166 lines)
- **docs/tooling/self-hosting.md** (13 lines)
- **docs/tooling/vscode.md** (13 lines)
- **editors/vscode/build-vsix.js** (36 lines)
- **editors/vscode/extension.js** (173 lines)
- **editors/vscode/icon-theme.json** (14 lines)
- **editors/vscode/language-configuration.json** (32 lines)
- **editors/vscode/package.json** (76 lines)
- **editors/vscode/README.md** (26 lines)
- **editors/vscode/snippets/zyra.json** (183 lines)
- **editors/vscode/syntaxes/zyra.tmLanguage.json** (147 lines)
- **GEMINI.md** (34 lines)
- **lsp/package.json** (22 lines)
- **lsp/src/server.ts** (246 lines)
- **lsp/tsconfig.json** (14 lines)
- **mkdocs.yml** (107 lines)
- **package.json** (6 lines)
- **package-lock.json** (3158 lines)
- **packaging/build-packages.js** (150 lines)
- **packaging/conda/build.sh** (4 lines)
- **packaging/conda/meta.yaml** (38 lines)
- **packaging/linux/get.sh** (59 lines)
- **packaging/windows/gui_installer_spec.md** (47 lines)
- **packaging/windows/installer.rs** (176 lines)
- **packaging/windows/make_msix.js** (113 lines)
- **README.md** (100 lines)
- **site/assets/javascripts/bundle.d7400e89.min.js** (17 lines)
- **site/assets/javascripts/lunr/min/lunr.ar.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.da.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.de.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.du.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.el.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.es.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.fi.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.fr.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.he.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.hi.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.hu.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.hy.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.it.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.ja.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.jp.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.kn.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.ko.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.multi.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.nl.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.no.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.pt.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.ro.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.ru.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.sa.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.stemmer.support.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.sv.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.ta.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.te.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.th.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.tr.min.js** (18 lines)
- **site/assets/javascripts/lunr/min/lunr.vi.min.js** (1 lines)
- **site/assets/javascripts/lunr/min/lunr.zh.min.js** (1 lines)
- **site/assets/javascripts/lunr/tinyseg.js** (206 lines)
- **site/assets/javascripts/lunr/wordcut.js** (6708 lines)
- **site/assets/javascripts/workers/search.2c215733.min.js** (43 lines)
- **site/search/search_index.json** (1 lines)
- **TARGET.md** (26 lines)
- **test_config.json** (1 lines)
- **test_io_data.json** (1 lines)
- **test_io_data.yaml** (2 lines)
- **vscode/language-configuration.json** (29 lines)
- **vscode/out/extension.js** (61 lines)
- **vscode/out/server.js** (11313 lines)
- **vscode/out/src/extension.js** (94 lines)
- **vscode/out/test/runTest.js** (51 lines)
- **vscode/out/test/suite/index.js** (21 lines)
- **vscode/package.json** (77 lines)
- **vscode/README.md** (30 lines)
- **vscode/snippets/zyra.json** (183 lines)
- **vscode/src/extension.ts** (83 lines)
- **vscode/src/vscode.d.ts** (2 lines)
- **vscode/syntaxes/zyra.tmLanguage.json** (147 lines)
- **vscode/test/runTest.js** (51 lines)
- **vscode/test/runTest.ts** (18 lines)
- **vscode/test/suite/index.js** (21 lines)
- **vscode/test/suite/index.ts** (21 lines)
- **vscode/tsconfig.json** (15 lines)
- **zyra.json** (16 lines)

## Key Symbol & Interface Index

### core/index.ts
- export const ZYRA_SELF_HOSTED = true; [L12]

### core/lib/logger.ts
- export function setVerbose(v: boolean) { [L3]
- export function info(...args: unknown[]) { [L7]
- export function debug(...args: unknown[]) { [L11]
- export function warn(...args: unknown[]) { [L15]
- export function error(...args: unknown[]) { [L19]

### core/test/branch_targets_final_push.test.ts
- export const branchTargetsFinalPush = test; [L93]

### core/test/branch_targets_more.test.ts
- export const branchTargetsMore = test; [L96]

### core/test/comprehensive.test.ts
- export const comprehensiveSuite = test; [L77]

### core/test/core_helpers.combined.test.ts
- export const coreHelpersSuite = test; [L128]

### core/test/cover_struct_enum_and_match_more.test.ts
- export const coverStructEnumAndMatchMore = test; [L76]

### core/test/enum.test.ts
- export const enumSuite = test; [L77]

### core/test/env.combined.test.ts
- export const envSuite = test; [L79]

### core/test/expr.combined.test.ts
- export const exprSuite = { [L721]

### core/test/helpers.test.ts
- export const helpersSuite = test; [L48]

### core/test/match.combined.test.ts
- export const matchSuite = test; [L413]

### core/test/merged_small_tests.test.ts
- export const mergedSmallSuite = test; [L292]

### core/test/rust_printer.test.ts
- export const rustPrinterSuite = test; [L71]

### core/test/self_host_full.test.ts
- export const selfHostFullSuite = test; [L46]

### core/test/self_host_lexer.test.ts
- export const selfHostLexerSuite = test; [L55]

### core/test/self_host_parser.test.ts
- export const selfHostParserSuite = test; [L56]

### core/test/stdlib.test.ts
- export const stdlibSuite = test; [L44]

### core/test/stmts.combined.test.ts
- export const stmtsSuite = test; [L350]

### core/test/stmts_struct_enum_decl.test.ts
- export const stmtsStructEnumDeclSuite = test; [L38]

### core/test/stmts_unreachable_more.test.ts
- export const stmtsUnreachableMoreSuite = test; [L43]

### core/test/struct.test.ts
- export const structSuite = test; [L82]

### core/test/targeted_branch_coverage.test.ts
- export const targetedSuite = test; [L128]

### core/test/unreachable.test.ts
- export const unreachableSuite = test; [L42]

### editors/vscode/extension.js
- function activate(context) { [L5]
- function deactivate() {} [L167]

### lsp/src/server.ts
- class PositionConverter { [L46]
- function formatType(ty: Ty): string { [L86]
- function findUsageAt(uri: string, offset: number) { [L176]

### site/assets/javascripts/lunr/wordcut.js
- function isMatch(pat, offset, ch) { [L421]
- function replacer(key, value) { [L704]
- function truncate(s, n) { [L717]
- function getMessage(self) { [L725]
- function fail(actual, expected, message, operator, stackStartFunction) { [L742]
- function ok(value, message) { [L762]
- function _deepEqual(actual, expected) { [L793]
- function isArguments(object) { [L838]
- function objEquiv(a, b) { [L842]
- function expectedException(actual, expected) { [L911]
- function _throws(shouldThrow, block, expected, message) { [L927]
- function balanced(a, b, str) { [L983]
- function maybeMatch(reg, str) { [L998]
- function range(a, b, str) { [L1004]
- function numeric(str) { [L1053]
- function escapeBraces(str) { [L1059]
- function unescapeBraces(str) { [L1067]
- function parseCommaParts(str) { [L1079]
- function expandTop(str) { [L1106]
- function identity(e) { [L1123]
- function embrace(str) { [L1127]
- function isPadded(el) { [L1130]
- function lte(i, y) { [L1134]
- function gte(i, y) { [L1137]
- function expand(str, isTop) { [L1141]
- function EventEmitter() { [L1283]
- function isFunction(arg) { [L1548]
- function isNumber(arg) { [L1552]
- function isObject(arg) { [L1556]
- function isUndefined(arg) { [L1560]
- function ownProp (obj, field) { [L1576]
- function alphasorti (a, b) { [L1585]
- function alphasort (a, b) { [L1589]
- function setupIgnores (self, options) { [L1593]
- function ignoreMap (pattern) { [L1604]
- function setopts (self, pattern, options) { [L1617]
- function deprecationWarning(options) { [L1684]
- function finish (self) { [L1700]
- function mark (self, p) { [L1753]
- function makeAbs (self, f) { [L1777]
- function isIgnored (self, path) { [L1794]
- function childrenIgnored (self, path) { [L1803]
- function glob (pattern, options, cb) { [L1878]
- function Glob (pattern, options, cb) { [L1916]
- function readdirCb (self, abs, cb) { [L2336]
- function globSync (pattern, options) { [L2589]
- function GlobSync (pattern, options) { [L2597]
- function inflight (key, cb) { [L3041]
- function makeres (key) { [L3051]
- function slice (args) { [L3082]
- function charSet (s) { [L3156]
- function filter (pattern, options) { [L3167]
- function ext (a, b) { [L3174]
- function minimatch (p, pattern, options) { [L3208]
- function Minimatch (pattern, options) { [L3226]
- function make () { [L3258]
- function parseNegate () { [L3314]
- function braceExpand (pattern, options) { [L3349]
- function parse (pattern, isSub) { [L3387]
- function makeRe () { [L3758]
- function match (f, partial) { [L3816]
- function globUnescape (s) { [L4033]
- function regExpEscape (s) { [L4037]
- function once (fn) { [L4062]
- function onceStrict (fn) { [L4072]
- function normalizeArray(parts, allowAboveRoot) { [L4112]
- function filter (xs, f) { [L4294]
- function posix(path) { [L4317]
- function win32(path) { [L4321]
- function defaultSetTimout() { [L4349]
- function defaultClearTimeout () { [L4352]
- function runTimeout(fun) { [L4375]
- function runClearTimeout(marker) { [L4400]
- function cleanUpNextTick() { [L4432]
- function drainQueue() { [L4447]
- function Item(fun, array) { [L4485]
- function noop() {} [L4499]
- function inspect(obj, opts) { [L6208]
- function stylizeWithColor(str, styleType) { [L6266]
- function stylizeNoColor(str, styleType) { [L6278]
- function arrayToHash(array) { [L6283]
- function formatValue(ctx, value, recurseTimes) { [L6294]
- function formatPrimitive(ctx, value) { [L6407]
- function formatError(value) { [L6426]
- function formatArray(ctx, value, recurseTimes, visibleKeys, keys) { [L6431]
- function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) { [L6451]
- function reduceToSingleString(output, base, braces) { [L6510]
- function isArray(ar) { [L6533]
- function isBoolean(arg) { [L6538]
- function isNull(arg) { [L6543]
- function isNullOrUndefined(arg) { [L6548]
- function isNumber(arg) { [L6553]
- function isString(arg) { [L6558]
- function isSymbol(arg) { [L6563]
- function isUndefined(arg) { [L6568]
- function isRegExp(re) { [L6573]
- function isObject(arg) { [L6578]
- function isDate(d) { [L6583]
- function isError(e) { [L6588]
- function isFunction(arg) { [L6594]
- function isPrimitive(arg) { [L6599]
- function objectToString(o) { [L6611]
- function pad(n) { [L6616]
- function timestamp() { [L6625]
- function hasOwnProperty(obj, prop) { [L6667]
- function wrappy (fn, cb) { [L6679]

### vscode/out/extension.js
- function activate(context) { [L43]
- function deactivate() { } [L60]

### vscode/out/server.js
- function mergeSort(data, compare) { [L9045]
- function computeLineOffsets(text, isAtLineStart, textOffset = 0) { [L9073]
- function isEOL(char) { [L9086]
- function getWellformedRange(range) { [L9089]
- function getWellformedEdit(textEdit) { [L9097]
- function mergeSpan(a, b) { [L9106]
- function lex(input) { [L9115]
- function typeToString(t) { [L10254]
- function isBoolish(t) { [L10265]
- function isEffectfulExpr(e) { [L10268]
- function makeCoreHelpers(opts) { [L10273]
- function makeEnvHelpers(opts) { [L10342]
- function makeMatchVisitor(opts) { [L10398]
- function makeExprVisitor(opts) { [L10535]
- function makeStmtVisitors(opts) { [L10762]
- function check(program, options) { [L10916]
- function __zyra_fmt(v) { [L11090]
- function formatType(ty) { [L11177]
- function findUsageAt(uri, offset) { [L11258]

### vscode/out/src/extension.js
- function activate(context) { [L42]
- function deactivate() { [L88]

### vscode/src/extension.ts
- export function activate(context: vscode.ExtensionContext) { [L12]
- export function deactivate(): Thenable<void> | undefined { [L77]
