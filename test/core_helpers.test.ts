import { test } from "uvu";
import * as assert from "uvu/assert";
import { makeCoreHelpers } from "../compiler/checkers/core_helpers.js";
import { sameType, typeToString } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("mustBe emits on mismatch", () => {
  const diags: any[] = [];
  const err = (message: string) => diags.push({ message });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  core.mustBe(T.Int, T.Int, "ok");
  assert.is(diags.length, 0);

  core.mustBe(T.Int, T.Bool, "bad");
  assert.is(diags.length, 1);
  assert.ok((diags[0].message as string).includes("bad"));
});

test("joinConcreteOrError handles Any/Unknown and incompatible mixes", () => {
  const diags: any[] = [];
  const err = (message: string) => diags.push({ message });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  // Unknown + Any => Any
  let out = core.joinConcreteOrError([T.Unknown, T.Any], "ctx");
  assert.is(out.kind, "Any");

  // Unit + Int => error and Unknown
  diags.length = 0;
  out = core.joinConcreteOrError([T.Unit, T.Int], "ctx");
  assert.is(out.kind, "Unknown");
  assert.is(diags.length, 1);

  // differing concretes -> error
  diags.length = 0;
  out = core.joinConcreteOrError([T.Int, T.Bool], "ctx");
  assert.is(out.kind, "Unknown");
  assert.is(diags.length, 1);

  // same concretes -> that type
  diags.length = 0;
  out = core.joinConcreteOrError([T.Int, T.Int], "ctx");
  assert.is(out.kind, "Int");
  assert.is(diags.length, 0);
});

test("requireValue and requireBranchValue emit on Unit", () => {
  const diags: any[] = [];
  const err = (message: string) => diags.push({ message });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  core.requireValue(T.Unit, "x");
  core.requireBranchValue(T.Unit, "y");
  assert.is(diags.length, 2);
});

test("implicitReturnFromBody appends return type when present", () => {
  const diags: any[] = [];
  const err = (message: string) => diags.push({ message });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const body = { ty: T.Int, alwaysReturns: false, returnTys: [T.Int] };
  const res = core.implicitReturnFromBody(body, null);
  assert.is(res.returnTys.length, 2);
  assert.is(res.returnTys[1].kind, "Int");
});

export const coreHelpersSuite = test;

