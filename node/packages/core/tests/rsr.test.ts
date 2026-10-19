import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseModifiedFiles, distillRunbook, exportTrajectory } from "../src/rsr.ts";
import { createRun } from "../src/ledger.ts";

test("parseModifiedFiles extracts modified file paths from unified git diff", () => {
  const sampleDiff = `
diff --git a/src/player.js b/src/player.js
index 1111111..2222222 100644
--- a/src/player.js
+++ b/src/player.js
@@ -76,1 +76,1 @@
-  this.vx = Math.max(P.moveSpeed, Math.abs(this.vx) * 0.985);
+  this.vx = Math.sign(this.vx) * P.moveSpeed;
diff --git a/config/game.json b/config/game.json
index 3333333..4444444 100644
`;
  const files = parseModifiedFiles(sampleDiff);
  assert.deepEqual(files, ["src/player.js", "config/game.json"]);
});

test("distillRunbook creates concise metadata without mutating original run", () => {
  const run = createRun("Fix speed cap bug");
  run.steps = 1;
  run.tokens = 450;
  run.reviewVerdict = "pass";
  run.tasks.push({ id: "t1", description: "Clamp velocity", status: "done", attempts: 1, result: "Fixed" });

  const patch = "diff --git a/src/player.js b/src/player.js\n+ clamped";
  const runbook = distillRunbook(run, patch);

  assert.equal(runbook.id, run.id);
  assert.equal(runbook.goal, "Fix speed cap bug");
  assert.equal(runbook.tasksCompleted, 1);
  assert.deepEqual(runbook.filesModified, ["src/player.js"]);
  assert.match(runbook.summary, /Fix speed cap bug.*src\/player\.js.*pass/);
});

test("exportTrajectory writes valid JSONL record to disk", async () => {
  const dir = await mkdtemp(join(tmpdir(), "rsr-test-"));
  const run = createRun("Test export");
  run.status = "completed";
  run.reviewVerdict = "pass";

  const exportedFile = await exportTrajectory(dir, run);
  assert.ok(exportedFile, "Must return exported file path");

  const content = await readFile(exportedFile, "utf8");
  const parsed = JSON.parse(content.trim());
  assert.equal(parsed.id, run.id);
  assert.equal(parsed.goal, "Test export");
  assert.equal(parsed.reviewVerdict, "pass");
});
