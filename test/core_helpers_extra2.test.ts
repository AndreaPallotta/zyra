import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("implicitReturnFromBody handles fn annotation branches", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });

  // resolveTypeNode returns Unit for the first case
  const coreUnit = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });
  const body = { ty: T.Int, alwaysReturns: false, returnTys: [T.Int] } as any;
  const resUnit = coreUnit.implicitReturnFromBody(body, { kind: 'Unit' } as any);
  // when annotation resolves to Unit, function returns original body
  assert.is(resUnit.returnTys.length, 1);

  // resolveTypeNode returns Int for the second case
  const coreInt = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Int, err });
  const resInt = coreInt.implicitReturnFromBody(body, { kind: 'Int' } as any);
  assert.is(resInt.returnTys.length, 1);
});

export const coreHelpersExtra2Suite = test;
