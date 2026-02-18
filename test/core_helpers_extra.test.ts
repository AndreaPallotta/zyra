import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { T } from "../compiler/checkers/types.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";

test("joinConcreteOrError returns Unknown when only Unknowns and no Any", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const out = core.joinConcreteOrError([T.Unknown, T.Unknown], "ctx");
  assert.is(out.kind, "Unknown");
});

test("mustBe does not emit when expected is Any", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  core.mustBe(T.Int, T.Any, "noerr");
  assert.is(diags.length, 0);
});

export const coreHelpersExtraSuite = test;
