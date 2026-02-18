import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeEnvHelpers } from "../compiler/checkers/env.js";
import { T } from "../compiler/checkers/types.js";

test("finishScope and warnUnusedTopLevel produce diagnostics for unused names", () => {
  const diags: any[] = [];
  const { err, warn, spanOf, declare, use, finishScope, warnUnusedTopLevel } = makeEnvHelpers({ diags, T });

  const scope: any = new Map();
  // declare unused local
  declare(scope, 'x', T.Int, { used: false, isTopLevel: false });
  // declare used local
  declare(scope, 'y', T.Int, { used: true, isTopLevel: false });
  finishScope(scope);

  const top: any = new Map();
  // declare unused top-level
  declare(top, 'a', T.Int, { used: false, isTopLevel: true });
  // declare ignored name starting with _
  declare(top, '_ignored', T.Int, { used: false, isTopLevel: true });
  warnUnusedTopLevel(top);

  assert.ok(diags.length >= 1);
});

export const envFinishScopeMoreSuite = test;
