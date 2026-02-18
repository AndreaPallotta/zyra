import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("implicitReturnFromBody appends Unit when body.ty is Unit", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const body = { ty: T.Unit, alwaysReturns: false, returnTys: [] } as any;
  const res = core.implicitReturnFromBody(body, null);
  // when body.ty is Unit, appended returnTys includes Unit
  assert.is(res.returnTys.length, 1);
  assert.is(res.returnTys[0].kind, 'Unit');
});

export const coreHelpersExtra3Suite = test;
