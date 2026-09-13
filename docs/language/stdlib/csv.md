# CSV and TSV Processing Subpackage (`csv`)

The `csv` module provides RFC-4180 compliant CSV and TSV parsing, keyed record extraction with headers, and delimited string generation with zero external dependencies.

---

## API Reference

### `csv.parse(text: String): [[String]]`
Parses CSV formatted text into a two-dimensional vector of strings. Handles quoted fields containing commas, line breaks, and escaped double quotes (`""`).

```zyra
def main(): Int {
  const raw = "id,name,role\n1,Alice,\"Lead, Core\"\n2,Bob,QA"
  const rows = csv.parse(raw)

  print("Total rows: {len(rows)}")
  print("User 1 role: {rows[1][2]}")
  return 0
}
```

### `csv.parse_tsv(text: String): [[String]]`
Parses tab-separated value (TSV) formatted text into a two-dimensional vector of strings.

```zyra
def main(): Int {
  const raw_tsv = "key\tval\nk1\tv1\nk2\tv2"
  const rows = csv.parse_tsv(raw_tsv)

  print("First key: {rows[1][0]}")
  return 0
}
```

### `csv.parse_with_headers(text: String): [ZyraMap]`
Parses CSV text by treating the first row as column headers, returning a vector of `ZyraMap` dictionaries mapping column names to cell values.

```zyra
def main(): Int {
  const raw = "id,name,department\n101,Alice,Platform\n102,Bob,Infrastructure"
  const records = csv.parse_with_headers(raw)

  const first = records[0]
  print("Name: {map.get(first, \"name\")}")
  print("Department: {map.get(first, \"department\")}")
  return 0
}
```

### `csv.stringify(rows: [[String]], delimiter: String): String`
Serializes a two-dimensional vector of strings into a delimited string. Automatically encloses cells containing delimiters, newlines, or quotes in double quotes.

```zyra
def main(): Int {
  const rows = [
    ["name", "comment"],
    ["Alice", "Project approved, ready for release"],
    ["Bob", "LGTM"]
  ]

  const output = csv.stringify(rows, ",")
  print(output)
  return 0
}
```
