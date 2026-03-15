import path from "node:path"

export type ResolveConfig = {
  projectRoot: string
  rootDirAbs: string
  outDirAbs: string
}

export function resolveZyPath(fromSpec: string, cfg: ResolveConfig): string {
  if (!fromSpec.startsWith("@/")) {
    throw new Error(`Only @/ imports are supported for now. Got: ${fromSpec}`)
  }

  const rel = fromSpec.slice(2)
  return path.resolve(cfg.rootDirAbs, rel + ".zy")
}

export function outJsPathForZy(zyAbsPath: string, cfg: ResolveConfig): string {
  const relFromRootDir = path.relative(cfg.rootDirAbs, zyAbsPath)
  const relNoExt = relFromRootDir.replace(/\.zy$/i, "")
  return path.resolve(cfg.outDirAbs, relNoExt + ".js")
}

export function toRelativeImport(fromOutJsAbs: string, toOutJsAbs: string): string {
  let rel = path.relative(path.dirname(fromOutJsAbs), toOutJsAbs)
  rel = rel.replaceAll(path.sep, "/")
  if (!rel.startsWith(".")) rel = "./" + rel
  return rel
}
