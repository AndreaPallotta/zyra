// This file centralizes imports of all existing suites and exposes
// a single `runAll()` function that executes them in order.
import { envSuite } from "./env.combined.test.js";
import { helpersSuite } from "./helpers.test.js";
import { exprSuite } from "./expr.combined.test.js";
import { stmtsSuite } from "./stmts.combined.test.js";
import { structSuite } from "./struct.test.js";
import { enumSuite } from "./enum.test.js";
import { unreachableSuite } from "./unreachable.test.js";

import { comprehensiveSuite } from "./comprehensive.test.ts";
import { stmtsMore2Suite } from "./stmts_more2.test.js";
import { stmtsMore3Suite } from "./stmts_more3.test.js";
import { stmtsJoinMoreSuite } from "./stmts_join_more.test.js";
import { stmtsMoreAdditionalSuite } from "./stmts_more_additional.test.js";
import { stmtsUnreachableMoreSuite } from "./stmts_unreachable_more.test.js";
import { coreHelpersSuite } from "./core_helpers.combined.test.js";
import { stmtsMoreCover2Suite } from "./stmts_more_cover2.test.js";
import { stmtsMoreCover3Suite } from "./stmts_more_cover3.test.js";
import { matchSuite } from "./match.combined.test.js";
import { exprMoreFinalSuite } from "./expr_more_final.test.js";
import { exprStructUpdateFieldAnnSuite } from "./expr_struct_update_fieldann.test.js";
import { exprBinaryUnknownOpSuite } from "./expr_binary_unknownop.test.js";
import { exprMatchUnitSuite } from "./expr_match_unit.test.js";
import { exprIfInitCasesSuite } from "./expr_if_init_cases.test.js";
import { mergedSmallSuite } from "./merged_small_tests.test.ts";

export async function runAll() {
  await envSuite.run();
  await helpersSuite.run();
  await exprSuite.run();
  await stmtsSuite.run();
  await matchSuite.run();
  await structSuite.run();
  await enumSuite.run();
  await unreachableSuite.run();
  await comprehensiveSuite.run();
  await stmtsMore2Suite.run();
  await stmtsMore3Suite.run();
  await stmtsJoinMoreSuite.run();
  await stmtsMoreAdditionalSuite.run();
  await stmtsUnreachableMoreSuite.run();
  await coreHelpersSuite.run();
  await stmtsMoreCover2Suite.run();
  await stmtsMoreCover3Suite.run();
  await exprMoreFinalSuite.run();
  await exprStructUpdateFieldAnnSuite.run();
  await exprBinaryUnknownOpSuite.run();
  await exprMatchUnitSuite.run();
  await exprIfInitCasesSuite.run();
  await mergedSmallSuite.run();
}
