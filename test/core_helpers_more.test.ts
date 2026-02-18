import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { T } from "../compiler/checkers/types.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";

test("implicitReturnFromBody respects explicit fn return annotation Unit", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const body = { ty: T.Unit, alwaysReturns: true, returnTys: [] } as any;
  const res = core.implicitReturnFromBody(body, { kind: "Unit" } as any);
  // with explicit Unit annotation, body is returned unchanged
  assert.is(res.alwaysReturns, true);
});

export const coreHelpersMoreSuite = test;
