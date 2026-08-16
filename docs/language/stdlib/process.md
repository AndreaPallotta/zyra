# Process Subpackage (`process`)

The `process` module manages child process execution, shell commands, and process exit status controls.

---

## API Reference

### `process.exec(cmd: String): String`
Executes shell command `cmd` using platform shell binary (`cmd.exe /C` on Windows, `sh -c` on POSIX systems) and captures stdout as text.

```zyra
const git_status = process.exec("git status")
print("Git status output:\n{git_status}")
```

### `process.exit(code: Int): Void`
Immediately terminates the current process execution, returning status integer `code` to the host system shell.

```zyra
if (path.exists("zyra.json") == false) {
  print("Error: Missing manifest file zyra.json")
  process.exit(1)
}
```
