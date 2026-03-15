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

test("implicitReturnFromBody respects explicit fn return annotation Unit", () => {
  const diags: any[] = [];
  const err = (m: string) => diags.push({ message: m });
  const core = makeCoreHelpers({ T, sameType, typeToString, resolveTypeNode: () => T.Unit, err });

  const body = { ty: T.Unit, alwaysReturns: true, returnTys: [] } as any;
  const res = core.implicitReturnFromBody(body, { kind: "Unit" } as any);
  // with explicit Unit annotation, body is returned unchanged
  assert.is(res.alwaysReturns, true);
});

export const coreHelpersSuite = test;
