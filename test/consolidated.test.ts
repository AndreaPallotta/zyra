// Aggregator that runs all existing test suites in one place.
// This keeps individual test files but provides a single import
// for the runner to reduce clutter in `run-all.ts`.
import * as suites from "./run-all-internal-imports.js";

export const consolidatedSuite = {
  async run() {
    // run-all-internal-imports exports an ordered `runAll()` helper
    await suites.runAll();
  },
};
