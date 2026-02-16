import {
  Program,
  Statement,
  Expression,
  Block,
  MatchExpr,
  MatchArm,
  TypeNode,
} from "./ast.js";

export type Diagnostic = { level: "error" | "warn"; message: string };

type Ty =
  | { kind: "Int" }
  | { kind: "Bool" }
  | { kind: "String" }
  | { kind: "Any" }
  | { kind: "Unknown" }
  | { kind: "Struct"; name: string }
  | { kind: "Enum"; name: string }
  | { kind: "Fn"; params: Ty[]; ret: Ty };

const T = {
  Int: { kind: "Int" } as Ty,
  Bool: { kind: "Bool" } as Ty,
  String: { kind: "String" } as Ty,
  Any: { kind: "Any" } as Ty,
  Unknown: { kind: "Unknown" } as Ty,
  Struct: (name: string): Ty => ({ kind: "Struct", name }),
  Enum: (name: string): Ty => ({ kind: "Enum", name }),
  Fn: (params: Ty[], ret: Ty): Ty => ({ kind: "Fn", params, ret }),
};

type ScopeEntry = { used: boolean; ty: Ty; isTopLevel: boolean };
type Scope = Map<string, ScopeEntry>;

type StructInfo = { fields: Map<string, Ty> };
type EnumInfo = {
  variants: Map<string, { payloadField: string | null; payloadTy: Ty | null }>;
};

export function check(program: Program): Diagnostic[] {
  const diags: Diagnostic[] = [];

  const err = (message: string) => diags.push({ level: "error", message });
  const warn = (message: string) => diags.push({ level: "warn", message });

  const structs = new Map<string, StructInfo>();
  const enums = new Map<string, EnumInfo>();

  const reservedStructFields = new Set(["__t", "__e", "__c"]);

  function resolveTypeNode(node: TypeNode | null): Ty {
    if (!node) return T.Unknown;
    if (node.type === "AnyType") return T.Any;
    const name = node.name;

    if (name === "Int") return T.Int;
    if (name === "Bool") return T.Bool;
    if (name === "String") return T.String;
    if (name === "Any") return T.Any;

    if (structs.has(name)) return T.Struct(name);
    if (enums.has(name)) return T.Enum(name);

    err(`Unknown type: ${name}`);
    return T.Unknown;
  }

  for (const st of program.body) {
    if (st.type === "StructDecl") {
      const fmap = new Map<string, Ty>();
      for (const f of st.fields) {
        if (reservedStructFields.has(f.name)) {
          err(`Struct ${st.name}: field '${f.name}' is reserved`);
        }
        if (fmap.has(f.name)) {
          err(`Struct ${st.name}: duplicate field '${f.name}'`);
        }
        fmap.set(f.name, resolveTypeNode(f.typeAnn));
      }
      structs.set(st.name, { fields: fmap });
    }

    if (st.type === "EnumDecl") {
      const vmap = new Map<
        string,
        { payloadField: string | null; payloadTy: Ty | null }
      >();

      for (const v of st.variants) {
        if (vmap.has(v.name)) {
          err(`Enum ${st.name}: duplicate variant '${v.name}'`);
        }
        const payloadTy = v.payloadType ? resolveTypeNode(v.payloadType) : null;
        vmap.set(v.name, { payloadField: v.payloadField, payloadTy });
      }

      enums.set(st.name, { variants: vmap });
    }
  }

  const globalScope: Scope = new Map();

  function declare(
    scope: Scope,
    name: string,
    ty: Ty,
    isTopLevel: boolean,
    used = false,
  ) {
    scope.set(name, { used, ty, isTopLevel });
  }

  function use(scopeStack: Scope[], name: string): Ty {
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      const entry = scopeStack[i].get(name);
      if (entry) {
        entry.used = true;
        return entry.ty;
      }
    }
    err(`Unknown identifier: ${name}`);
    return T.Unknown;
  }

  function finishLocalScope(scope: Scope) {
    for (const [name, meta] of scope.entries()) {
      if (meta.isTopLevel) continue;
      if (!meta.used && !name.startsWith("_")) {
        err(`Unused variable: ${name}`);
      }
    }
  }

  function warnUnusedTopLevel(scope: Scope) {
    for (const [name, meta] of scope.entries()) {
      if (!meta.isTopLevel) continue;
      if (!meta.used && !name.startsWith("_")) {
        warn(`Unused top-level declaration: ${name}`);
      }
    }
  }

  function typeError(msg: string, got: Ty, expected: Ty) {
    err(`${msg}: expected ${typeToString(expected)}, got ${typeToString(got)}`);
  }

  function visitProgram() {
    const stack: Scope[] = [globalScope];

    for (const st of program.body) {
      if (st.type === "ReturnStmt") {
        err(`'return' is not allowed at top-level`);
        continue;
      }
      visitStatement(st, stack, true, null);
    }

    warnUnusedTopLevel(globalScope);
  }

  function visitStatement(
    st: Statement,
    stack: Scope[],
    isTopLevel: boolean,
    expectedReturn: Ty | null,
  ): Ty {
    switch (st.type) {
      case "StructDecl":
      case "EnumDecl":
        return T.Unknown;

      case "ImportDecl": {
        const scope = stack[stack.length - 1];
        for (const n of st.names) {
          declare(scope, n, T.Any, isTopLevel, true);
        }
        return T.Unknown;
      }

      case "VarDecl": {
        const scope = stack[stack.length - 1];
        const declared = resolveTypeNode(st.typeAnn);
        const initTy = visitExpr(st.initializer, stack);

        let finalTy = initTy;

        if (st.typeAnn) {
          finalTy = declared;
          if (
            declared.kind !== "Any" &&
            declared.kind !== "Unknown" &&
            initTy.kind !== "Any" &&
            initTy.kind !== "Unknown" &&
            !sameType(declared, initTy)
          ) {
            typeError(`Type mismatch in '${st.name}'`, initTy, declared);
          }
        } else {
          if (initTy.kind === "Unknown") finalTy = T.Unknown;
        }

        declare(scope, st.name, finalTy, isTopLevel, !!st.isExported);
        return T.Unknown;
      }

      case "FunctionDecl": {
        const outer = stack[stack.length - 1];

        const paramTys = st.params.map((p) => resolveTypeNode(p.typeAnn));
        const declaredRet = resolveTypeNode(st.retType);

        declare(
          outer,
          st.name,
          T.Fn(paramTys, declaredRet),
          isTopLevel,
          !!st.isExported,
        );

        const fnScope: Scope = new Map();
        stack.push(fnScope);

        for (let i = 0; i < st.params.length; i++) {
          declare(fnScope, st.params[i].name, paramTys[i], false);
        }

        const bodyTy = visitBlock(st.body, stack, declaredRet);

        let effectiveRet = declaredRet;

        if (st.retType) {
          if (
            declaredRet.kind !== "Any" &&
            declaredRet.kind !== "Unknown" &&
            bodyTy.kind !== "Any" &&
            bodyTy.kind !== "Unknown" &&
            !sameType(declaredRet, bodyTy)
          ) {
            err(
              `Return type mismatch in '${st.name}': expected ${typeToString(
                declaredRet,
              )}, got ${typeToString(bodyTy)}`,
            );
          }
        } else {
          effectiveRet = bodyTy;
        }

        const entry = outer.get(st.name);
        if (entry && entry.ty.kind === "Fn") {
          entry.ty = T.Fn(paramTys, effectiveRet);
        }

        finishLocalScope(fnScope);
        stack.pop();
        return T.Unknown;
      }

      case "ExpressionStmt":
        visitExpr(st.expression, stack);
        return T.Unknown;

      case "PrintStmt":
        for (const a of st.args) visitExpr(a, stack);
        return T.Unknown;

      case "ReturnStmt": {
        if (!expectedReturn) {
          err(`'return' is only allowed inside functions`);
          if (st.value) visitExpr(st.value, stack);
          return T.Unknown;
        }

        if (st.value == null) {
          if (
            expectedReturn.kind !== "Any" &&
            expectedReturn.kind !== "Unknown"
          ) {
            err(
              `Return type mismatch: expected ${typeToString(expectedReturn)}, got Void`,
            );
          }
          return expectedReturn;
        }

        const vty = visitExpr(st.value, stack);

        if (
          expectedReturn.kind !== "Any" &&
          expectedReturn.kind !== "Unknown" &&
          vty.kind !== "Any" &&
          vty.kind !== "Unknown" &&
          !sameType(expectedReturn, vty)
        ) {
          err(
            `Return type mismatch: expected ${typeToString(
              expectedReturn,
            )}, got ${typeToString(vty)}`,
          );
        }

        return expectedReturn;
      }
    }
  }

  function visitBlock(b: Block, stack: Scope[], expectedReturn: Ty | null): Ty {
    const scope: Scope = new Map();
    stack.push(scope);

    let lastExprTy: Ty = T.Unknown;
    for (const st of b.statements) {
      if (st.type === "ReturnStmt") {
        visitStatement(st, stack, false, expectedReturn);
        lastExprTy = expectedReturn ?? T.Unknown;
        continue;
      }

      if (st.type === "ExpressionStmt") {
        lastExprTy = visitExpr(st.expression, stack);
      } else {
        visitStatement(st, stack, false, expectedReturn);
      }
    }

    finishLocalScope(scope);
    stack.pop();

    return lastExprTy;
  }

  function visitExpr(e: Expression, stack: Scope[]): Ty {
    switch (e.type) {
      case "Identifier":
        return use(stack, e.name);

      case "IntLiteral":
        return T.Int;

      case "StringLiteral":
        return T.String;

      case "BoolLiteral":
        return T.Bool;

      case "InterpString":
        for (const p of e.parts) {
          if (p.type === "Expr") visitExpr(p.expr, stack);
        }
        return T.String;

      case "UnaryExpr": {
        const t = visitExpr(e.operand, stack);
        if (e.operator === "!") {
          if (t.kind !== "Any" && t.kind !== "Unknown" && t.kind !== "Bool") {
            err(`Operator '!' expects Bool`);
          }
          return T.Bool;
        }
        return T.Unknown;
      }

      case "BinaryExpr": {
        const lt = visitExpr(e.left, stack);
        const rt = visitExpr(e.right, stack);

        if (["+", "-", "*", "/"].includes(e.operator)) {
          if (lt.kind !== "Any" && lt.kind !== "Unknown" && lt.kind !== "Int") {
            err(`Operator '${e.operator}' expects Int`);
          }
          if (rt.kind !== "Any" && rt.kind !== "Unknown" && rt.kind !== "Int") {
            err(`Operator '${e.operator}' expects Int`);
          }
          return T.Int;
        }

        if (["<", "<=", ">", ">="].includes(e.operator)) {
          if (lt.kind !== "Any" && lt.kind !== "Unknown" && lt.kind !== "Int") {
            err(`Operator '${e.operator}' expects Int`);
          }
          if (rt.kind !== "Any" && rt.kind !== "Unknown" && rt.kind !== "Int") {
            err(`Operator '${e.operator}' expects Int`);
          }
          return T.Bool;
        }

        if (["==", "!="].includes(e.operator)) {
          if (
            lt.kind !== "Any" &&
            lt.kind !== "Unknown" &&
            rt.kind !== "Any" &&
            rt.kind !== "Unknown" &&
            !sameType(lt, rt)
          ) {
            err(
              `Type mismatch in comparison: ${typeToString(lt)} ${e.operator} ${typeToString(rt)}`,
            );
          }
          return T.Bool;
        }

        if (["&&", "||"].includes(e.operator)) {
          if (
            lt.kind !== "Any" &&
            lt.kind !== "Unknown" &&
            lt.kind !== "Bool"
          ) {
            err(`Operator '${e.operator}' expects Bool`);
          }
          if (
            rt.kind !== "Any" &&
            rt.kind !== "Unknown" &&
            rt.kind !== "Bool"
          ) {
            err(`Operator '${e.operator}' expects Bool`);
          }
          return T.Bool;
        }

        return T.Unknown;
      }

      case "CallExpr": {
        const calleeTy = visitExpr(e.callee, stack);
        for (const a of e.args) visitExpr(a, stack);

        if (calleeTy.kind !== "Fn") {
          err(`Call target is not a function`);
          return T.Unknown;
        }

        if (e.args.length !== calleeTy.params.length) {
          err(
            `Arity mismatch: expected ${calleeTy.params.length}, got ${e.args.length}`,
          );
          return calleeTy.ret;
        }

        for (let i = 0; i < e.args.length; i++) {
          const argTy = visitExpr(e.args[i], stack);
          const paramTy = calleeTy.params[i];

          if (
            paramTy.kind !== "Any" &&
            paramTy.kind !== "Unknown" &&
            argTy.kind !== "Any" &&
            argTy.kind !== "Unknown" &&
            !sameType(paramTy, argTy)
          ) {
            err(
              `Type mismatch in call arg ${i + 1}: expected ${typeToString(
                paramTy,
              )}, got ${typeToString(argTy)}`,
            );
          }
        }

        return calleeTy.ret;
      }

      case "IfExpr": {
        if (e.init) visitStatement(e.init as any, stack, false, null);

        const ct = visitExpr(e.condition, stack);
        if (ct.kind !== "Any" && ct.kind !== "Unknown" && ct.kind !== "Bool") {
          err(`If condition must be boolean`);
        }

        const thenTy = visitBlock(e.thenBranch, stack, null);

        let elseTy: Ty;
        if (e.elseBranch.type === "IfExpr")
          elseTy = visitExpr(e.elseBranch, stack);
        else elseTy = visitBlock(e.elseBranch, stack, null);

        return joinTypes(thenTy, elseTy);
      }

      case "StructLiteral": {
        const info = structs.get(e.name);
        if (!info) {
          err(`Unknown struct: ${e.name}`);
          for (const f of e.fields) visitExpr(f.value, stack);
          return T.Unknown;
        }

        const seen = new Set<string>();
        for (const f of e.fields) {
          const expected = info.fields.get(f.name);
          if (!expected) {
            err(`Unknown field '${f.name}' in ${e.name}`);
            visitExpr(f.value, stack);
            continue;
          }

          if (seen.has(f.name)) {
            err(`Duplicate field '${f.name}' in ${e.name}`);
          }
          seen.add(f.name);

          const got = visitExpr(f.value, stack);

          if (
            expected.kind !== "Any" &&
            expected.kind !== "Unknown" &&
            got.kind !== "Any" &&
            got.kind !== "Unknown" &&
            !sameType(expected, got)
          ) {
            err(
              `Type mismatch for ${e.name}.${f.name}: expected ${typeToString(
                expected,
              )}, got ${typeToString(got)}`,
            );
          }
        }

        for (const req of info.fields.keys()) {
          if (!seen.has(req)) {
            err(`Missing field '${req}' in ${e.name}`);
          }
        }

        return T.Struct(e.name);
      }

      case "StructUpdateExpr": {
        const targetTy = visitExpr(e.target, stack);

        if (targetTy.kind !== "Struct") {
          err(`Struct update target must be a struct`);
          for (const f of e.fields) visitExpr(f.value, stack);
          return T.Unknown;
        }

        const info = structs.get(targetTy.name);
        if (!info) {
          err(`Unknown struct: ${targetTy.name}`);
          for (const f of e.fields) visitExpr(f.value, stack);
          return targetTy;
        }

        const seen = new Set<string>();
        for (const f of e.fields) {
          const expected = info.fields.get(f.name);
          if (!expected) {
            err(`Unknown field '${f.name}' in ${targetTy.name}`);
            visitExpr(f.value, stack);
            continue;
          }

          if (seen.has(f.name)) err(`Duplicate field '${f.name}' in update`);
          seen.add(f.name);

          const got = visitExpr(f.value, stack);
          if (
            expected.kind !== "Any" &&
            expected.kind !== "Unknown" &&
            got.kind !== "Any" &&
            got.kind !== "Unknown" &&
            !sameType(expected, got)
          ) {
            err(
              `Type mismatch for ${targetTy.name}.${f.name}: expected ${typeToString(
                expected,
              )}, got ${typeToString(got)}`,
            );
          }
        }

        return targetTy;
      }

      case "EnumLiteral": {
        const info = enums.get(e.enumName);
        if (!info) {
          err(`Unknown enum: ${e.enumName}`);
          if (e.payload) visitExpr(e.payload, stack);
          return T.Unknown;
        }

        const vinfo = info.variants.get(e.variant);
        if (!vinfo) {
          err(`Unknown variant '${e.variant}' in ${e.enumName}`);
          if (e.payload) visitExpr(e.payload, stack);
          return T.Enum(e.enumName);
        }

        if (vinfo.payloadField == null && e.payload != null) {
          err(`${e.variant} takes no arguments`);
          visitExpr(e.payload, stack);
          return T.Enum(e.enumName);
        }

        if (vinfo.payloadField != null && e.payload == null) {
          err(`${e.variant} expects 1 argument`);
          return T.Enum(e.enumName);
        }

        if (e.payload && vinfo.payloadTy) {
          const got = visitExpr(e.payload, stack);
          const expected = vinfo.payloadTy;

          if (
            expected.kind !== "Any" &&
            expected.kind !== "Unknown" &&
            got.kind !== "Any" &&
            got.kind !== "Unknown" &&
            !sameType(expected, got)
          ) {
            err(
              `Enum payload type mismatch for ${e.enumName}.${e.variant}: expected ${typeToString(
                expected,
              )}, got ${typeToString(got)}`,
            );
          }
        } else if (e.payload) {
          visitExpr(e.payload, stack);
        }

        return T.Enum(e.enumName);
      }

      case "MatchExpr":
        return visitMatch(e, stack);

      case "Block":
        return visitBlock(e, stack, null);
    }
  }

  function visitMatch(m: MatchExpr, stack: Scope[]): Ty {
    const scrutTy = visitExpr(m.value, stack);

    let enumName: string | null = null;
    if (scrutTy.kind === "Enum") enumName = scrutTy.name;

    if (enumName) {
      const seenUnguarded = new Set<string>();
      for (const arm of m.arms) {
        if (arm.pattern.type !== "VariantPattern") continue;
        if (arm.guard != null) continue;
        const v = arm.pattern.variant;
        if (seenUnguarded.has(v))
          err(`Duplicate unguarded match arm for '${v}'`);
        seenUnguarded.add(v);
      }

      const hasUnguardedSeen = new Set<string>();
      for (const arm of m.arms) {
        if (arm.pattern.type !== "VariantPattern") continue;
        const v = arm.pattern.variant;
        if (hasUnguardedSeen.has(v)) {
          err(`Unreachable match arm for '${v}' after unguarded arm`);
          continue;
        }
        if (arm.guard == null) hasUnguardedSeen.add(v);
      }
    }

    for (let i = 0; i < m.arms.length; i++) {
      const arm = m.arms[i];
      if (arm.pattern.type === "WildcardPattern" && arm.guard == null) {
        if (i !== m.arms.length - 1) err(`Unreachable match arms after '_'`);
        break;
      }
    }

    if (enumName) {
      const info = enums.get(enumName);
      if (info) {
        const hasUnguardedWildcard = m.arms.some(
          (a: MatchArm) =>
            a.pattern.type === "WildcardPattern" && a.guard == null,
        );

        if (!hasUnguardedWildcard) {
          const seen = new Set<string>();
          for (const arm of m.arms) {
            if (arm.pattern.type === "VariantPattern" && arm.guard == null) {
              seen.add(arm.pattern.variant);
            }
          }
          for (const v of info.variants.keys()) {
            if (!seen.has(v))
              err(`Non-exhaustive match on ${enumName}: missing '${v}'`);
          }
        }

        for (const arm of m.arms) {
          if (arm.pattern.type === "VariantPattern") {
            const vinfo = info.variants.get(arm.pattern.variant);
            if (!vinfo) continue;
            if (vinfo.payloadField == null && arm.pattern.bind) {
              err(`${arm.pattern.variant} has no payload to bind`);
            }
          }
        }
      }
    }

    let outTy: Ty = T.Unknown;

    for (const arm of m.arms) {
      const armScope: Scope = new Map();
      stack.push(armScope);

      if (arm.pattern.type === "VariantPattern" && arm.pattern.bind) {
        let bindTy: Ty = T.Any;

        if (enumName) {
          const info = enums.get(enumName);
          const vinfo = info?.variants.get(arm.pattern.variant);
          if (vinfo?.payloadTy) bindTy = vinfo.payloadTy;
        }

        declare(armScope, arm.pattern.bind, bindTy, false);
      }

      if (arm.guard) {
        const gt = visitExpr(arm.guard, stack);
        if (gt.kind !== "Any" && gt.kind !== "Unknown" && gt.kind !== "Bool") {
          err(`Match guard must be boolean`);
        }
      }

      const armTy = visitExpr(arm.body, stack);
      outTy = outTy.kind === "Unknown" ? armTy : joinTypes(outTy, armTy);

      finishLocalScope(armScope);
      stack.pop();
    }

    return outTy;
  }

  function joinTypes(a: Ty, b: Ty): Ty {
    if (a.kind === "Any" || b.kind === "Any") return T.Any;
    if (a.kind === "Unknown") return b;
    if (b.kind === "Unknown") return a;
    if (sameType(a, b)) return a;
    return T.Any;
  }

  function sameType(a: Ty, b: Ty): boolean {
    if (a.kind === "Any" || b.kind === "Any") return true;
    if (a.kind !== b.kind) return false;
    if (a.kind === "Struct" || a.kind === "Enum")
      return a.name === (b as any).name;
    if (a.kind === "Fn") {
      const fb = b as any;
      return (
        a.params.length === fb.params.length &&
        a.params.every((t, i) => sameType(t, fb.params[i])) &&
        sameType(a.ret, fb.ret)
      );
    }
    return true;
  }

  function typeToString(t: Ty): string {
    switch (t.kind) {
      case "Struct":
      case "Enum":
        return `${t.kind}(${t.name})`;
      case "Fn":
        return `fn(${t.params.map(typeToString).join(", ")})->${typeToString(t.ret)}`;
      default:
        return t.kind;
    }
  }

  visitProgram();
  return diags;
}
