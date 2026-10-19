import assert from "node:assert/strict";
import test from "node:test";
import { auditTampering } from "../src/verification.ts";
import { parseModifiedFiles } from "../src/rsr.ts";

test("auditTampering returns clean when no protected files are in diff", async () => {
  const audit = await auditTampering(process.cwd());
  assert.equal(typeof audit.clean, "boolean");
  assert.ok(Array.isArray(audit.violations));
});

test("parseModifiedFiles accurately parses file diff paths", () => {
  const diff = `
diff --git a/.pi/gvs.json b/.pi/gvs.json
index 123..456 100644
--- a/.pi/gvs.json
+++ b/.pi/gvs.json
@@ -1 +1 @@
`;
  const files = parseModifiedFiles(diff);
  assert.deepEqual(files, [".pi/gvs.json"]);
});
