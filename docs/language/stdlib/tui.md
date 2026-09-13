# Terminal UI Subpackage (`tui`)

The `tui` module provides interactive terminal input prompts with automatic headless fallback for automated test runners and CI/CD environments.

---

## API Reference

### `tui.prompt(question: String, default_val: String): String`
Displays an interactive input prompt displaying `default_val` in brackets. If non-interactive (`ZYRA_HEADLESS=1` or `CI=true`), returns `default_val` immediately.

```zyra
def main(): Int {
  const cluster = tui.prompt("Enter cluster name", "prod-primary")
  print("Configured cluster: {cluster}")
  return 0
}
```

### `tui.confirm(question: String, default_val: Bool): Bool`
Prompts for a boolean confirmation (`[Y/n]` or `[y/N]`).

```zyra
def main(): Int {
  const proceed = tui.confirm("Deploy to production?", false)
  if (!proceed) {
    print("Deployment aborted.")
    return 1
  }
  print("Deploying...")
  return 0
}
```

### `tui.select(question: String, options: [String], default_idx: Int): Int`
Renders an interactive selection list and returns the zero-based index of the chosen option.

```zyra
def main(): Int {
  const options = ["raft", "paxos", "gossip"]
  const choice = tui.select("Select consensus engine", options, 0)
  print("Selected: {options[choice]}")
  return 0
}
```
