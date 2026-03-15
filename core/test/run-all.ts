import { readdirSync } from "fs";
import { error } from "../lib/logger.js";

// Dynamically import and run all test suites exported from `*.test.ts` files.
// Each test file exports a suite named like `<something>Suite`.
const dirPath = new URL("./", import.meta.url).pathname;
const files = readdirSync(dirPath).filter((f) => f.endsWith(".test.ts") || f.endsWith(".test.js"));

for (const file of files.sort()) {
  try {
    const mod = await import(`./${file}`);
    const suiteKey = Object.keys(mod).find((k) => k.toLowerCase().endsWith("suite"));
    if (suiteKey && typeof mod[suiteKey]?.run === "function") {
      // run suites sequentially
      // eslint-disable-next-line no-await-in-loop
      await mod[suiteKey].run();
    }
  } catch (err) {
    // show which file failed to import/run, then rethrow so CI/test runner fails clearly
    error("Failed running tests for", file, err);
    throw err;
  }
}
