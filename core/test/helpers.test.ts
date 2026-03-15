import { test } from "uvu";
import * as assert from "uvu/assert";
import { sameType, typeToString, isBoolish, isEffectfulExpr } from "../compiler/checkers/helpers.js";
import { T } from "../compiler/checkers/types.js";

test("sameType allows Any and Unknown", () => {
  assert.ok(sameType(T.Any, T.Int));
  assert.ok(sameType(T.Unknown, T.Int));
});

test("sameType struct and enum name equality", () => {
  assert.ok(sameType(T.Struct("P"), T.Struct("P")));
  assert.not.ok(sameType(T.Struct("P"), T.Struct("Q")));
  assert.ok(sameType(T.Enum("E"), T.Enum("E")));
  assert.not.ok(sameType(T.Enum("E"), T.Enum("F")));
});

test("sameType function signature comparison", () => {
  const f1 = T.Fn([T.Int, T.Bool], T.Unit);
  const f2 = T.Fn([T.Int, T.Bool], T.Unit);
  const f3 = T.Fn([T.Int], T.Unit);
  assert.ok(sameType(f1, f2));
  assert.not.ok(sameType(f1, f3));
});

test("typeToString formats types", () => {
  assert.is(typeToString(T.Int), "Int");
  assert.is(typeToString(T.Struct("Point")), "Struct(Point)");
  assert.is(typeToString(T.Enum("Tag")), "Enum(Tag)");
  assert.is(typeToString(T.Fn([T.Int], T.Unit)), "fn(Int)->Unit");
});

test("isBoolish true for Bool/Any/Unknown", () => {
  assert.ok(isBoolish(T.Bool));
  assert.ok(isBoolish(T.Any));
  assert.ok(isBoolish(T.Unknown));
  assert.not.ok(isBoolish(T.Int));
});

test("isEffectfulExpr recognizes effectful nodes", () => {
  assert.ok(isEffectfulExpr({ type: "CallExpr" }));
  assert.ok(isEffectfulExpr({ type: "IfExpr" }));
  assert.ok(isEffectfulExpr({ type: "MatchExpr" }));
  assert.ok(isEffectfulExpr({ type: "Block" }));
  assert.not.ok(isEffectfulExpr({ type: "Literal" }));
});

export const helpersSuite = test;

