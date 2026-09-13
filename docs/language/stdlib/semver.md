# Semantic Versioning Subpackage (`semver`)

The `semver` module provides Semantic Versioning (SemVer 2.0.0) parsing, precedence comparison, range satisfaction testing, and version incrementing.

---

## API Reference

### `semver.parse(version: String): ZyraSemver`
Parses a SemVer string into a `ZyraSemver` struct containing `major`, `minor`, `patch`, `prerelease`, and `build` fields.

```zyra
def main(): Int {
  const v = semver.parse("2.6.0-rc.1+build.42")
  print("Major: {v.major}")
  print("Minor: {v.minor}")
  print("Patch: {v.patch}")
  print("Prerelease: {v.prerelease}")
  print("Build: {v.build}")
  return 0
}
```

### `semver.compare(v1: Any, v2: Any): Int`
Compares two versions (either `ZyraSemver` structs or strings). Returns:
- `1` if `v1 > v2`
- `-1` if `v1 < v2`
- `0` if `v1 == v2`

Pre-release tags follow SemVer precedence rules (e.g. `1.0.0-alpha < 1.0.0`).

```zyra
def main(): Int {
  print(semver.compare("2.6.0", "2.5.9"))     // 1
  print(semver.compare("1.0.0-alpha", "1.0.0")) // -1
  print(semver.compare("2.0.0", "2.0.0"))     // 0
  return 0
}
```

### `semver.satisfies(version: Any, range: String): Bool`
Evaluates whether a version matches a SemVer range specification. Supports:
- Caret ranges (`^1.2.3`): compatible updates without modifying left-most non-zero digit.
- Tilde ranges (`~1.2.3`): patch-level updates.
- Comparison operators (`>=`, `<=`, `>`, `<`, `=`).
- Wildcards (`*`, `""`).

```zyra
def main(): Int {
  print(semver.satisfies("2.6.4", "^2.6.0")) // true
  print(semver.satisfies("3.0.0", "^2.6.0")) // false
  print(semver.satisfies("2.6.8", "~2.6.0")) // true
  print(semver.satisfies("2.7.0", "~2.6.0")) // false
  print(semver.satisfies("2.6.0", ">=2.0.0")) // true
  return 0
}
```

### `semver.bump_major(v: Any): ZyraSemver`
Increments the major version component and resets minor and patch to 0.

### `semver.bump_minor(v: Any): ZyraSemver`
Increments the minor version component and resets patch to 0.

### `semver.bump_patch(v: Any): ZyraSemver`
Increments the patch version component.

```zyra
def main(): Int {
  print(semver.bump_major("1.2.3")) // 2.0.0
  print(semver.bump_minor("1.2.3")) // 1.3.0
  print(semver.bump_patch("1.2.3")) // 1.2.4
  return 0
}
```
