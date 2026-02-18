import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeEnvHelpers } from "../compiler/checkers/env.js";
import { T } from "../compiler/checkers/types.js";

test("declare and use marks used and returns type", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });
  const scope = new Map<string, any>();
  env.declare(scope, "x", T.Int, { used: false, isTopLevel: false });
  const ty = env.use([scope], "x");
  assert.is(ty.kind, "Int");
  assert.is((scope.get("x") as any).used, true);
  assert.is(diags.length, 0);
});

test("use unknown produces diagnostic and returns Unknown", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });
  const scope = new Map<string, any>();
  const ty = env.use([scope], "y");
  assert.is(ty.kind, "Unknown");
  assert.is(diags.length, 1);
  assert.ok((diags[0].message as string).includes("Unknown identifier"));
});

test("finishScope emits unused variable error", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });
  const scope = new Map<string, any>();
  scope.set("a", { used: false, ty: T.Int, isTopLevel: false, isExported: false });
  env.finishScope(scope);
  assert.is(diags.length, 1);
  assert.ok((diags[0].message as string).includes("Unused variable: a"));
});

test("warnUnusedTopLevel emits a warning", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });
  const scope = new Map<string, any>();
  scope.set("b", { used: false, ty: T.Int, isTopLevel: true, isExported: false });
  env.warnUnusedTopLevel(scope);
  assert.is(diags.length, 1);
  assert.is(diags[0].level, "warn");
});

export const envSuite = test;
