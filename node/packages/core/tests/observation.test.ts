import assert from "node:assert/strict";
import test from "node:test";
import { stripAnsi, dehydrateObservation } from "../src/observation.ts";

test("stripAnsi removes ANSI color codes and cursor jumps", () => {
  const colored = "\u001b[31mError:\u001b[0m \u001b[1;32mEverything failed\u001b[0m";
  assert.strictEqual(stripAnsi(colored), "Error: Everything failed");
});

test("dehydrateObservation leaves short outputs untouched", () => {
  const shortLog = "cargo test\nrunning 1 test\ntest result: ok. 1 passed; 0 failed\n";
  const result = dehydrateObservation("bash", shortLog);
  assert.strictEqual(result, shortLog);
});

test("dehydrateObservation compresses verbose compiler noise while preserving errors", () => {
  // Simulate 300 lines of compilation spam with an error in the middle and a failure summary at tail
  const lines: string[] = [];
  lines.push("Compiling project v0.1.0");
  for (let i = 1; i <= 200; i++) {
    lines.push(`   Compiling crate-dep-${i} v1.0.0`);
  }
  // Inject critical error in the middle
  lines.push("error[E0425]: cannot find value `max_speed` in this scope at src/player.rs:76");
  for (let i = 201; i <= 300; i++) {
    lines.push(`   Compiling crate-dep-${i} v1.0.0`);
  }
  lines.push("error: could not compile `project` due to 1 previous error");
  lines.push("test failed, exit status 101");

  const raw = lines.join("\n");
  assert.ok(raw.length > 8000, "Raw input must be large");

  const dehydrated = dehydrateObservation("bash", raw);

  // Assertions
  assert.ok(dehydrated.length < raw.length * 0.35, "Must reduce character count by at least 65%");
  assert.ok(dehydrated.includes("[... TBOD:"), "Must contain TBOD omission notice");
  assert.ok(dehydrated.includes("cannot find value `max_speed`"), "Must preserve intermediate error line");
  assert.ok(dehydrated.includes("Compiling project v0.1.0"), "Must preserve head lines");
  assert.ok(dehydrated.includes("test failed, exit status 101"), "Must preserve tail status lines");
});

test("dehydrateObservation does not truncate file reading content (read/write)", () => {
  const codeLines: string[] = [];
  for (let i = 1; i <= 150; i++) {
    codeLines.push(`export const line_${i} = ${i};`);
  }
  const code = codeLines.join("\n");
  const result = dehydrateObservation("read", code);
  assert.strictEqual(result, code, "read tool output must never be truncated");
});

test("dehydrateObservation folds excessive grep/find results", () => {
  const grepLines: string[] = [];
  for (let i = 1; i <= 200; i++) {
    grepLines.push(`src/file_${i}.ts:42: const target = true;`);
  }
  const result = dehydrateObservation("grep", grepLines.join("\n"));
  assert.ok(result.includes("[... TBOD: 150 additional search results omitted. Refine query pattern ...]"));
});
