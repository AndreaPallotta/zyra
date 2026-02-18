import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeEnvHelpers } from "../compiler/checkers/env.js";
import { T } from "../compiler/checkers/types.js";

test("spanOf returns span when present and undefined otherwise", () => {
  const diags: any[] = [];
  const env = makeEnvHelpers({ diags, T });

  const has = { span: { start: 1, end: 2 } } as any;
  const nothing = { foo: 1 } as any;

  assert.ok(env.spanOf(has));
  assert.is(env.spanOf(nothing), undefined);
});

export const envMoreSuite = test;
