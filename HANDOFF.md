# AI Development Handoff Specification

## 0. Handoff Metadata

* **Specification Version**: 1.2.0 (Tri-Language Monorepo Unified & Golden Standard Aligned)
* **Generated At**: 2026-09-30T15:00:00Z
* **Workspace Root**: `C:\dev\pi-gvs5h`
* **Node Core Package**: `C:\dev\pi-gvs5h\node\packages\core`
* **Validation Harness**: `C:\dev\pi-gvs5h\tools\validation`
* **Authoring Context**: AI System Architecture & Engineering Research Session
* **Reproducibility Rating**: FULLY REPRODUCIBLE (Tri-language monorepo topology confirmed, 20/20 unit tests pass, grader/runner selftests pass, ground-truth real-model benchmark verified).

---

## 1. Project Identity

* **[FACT] Project Name**: `pi-gvs5h` (derived and upgraded from `srossitto79/pi-gvs5h`, originating from arXiv:2608.26480v2 `GVS5H`).
* **[FACT] Project Nature**: A native TypeScript Extension Package for Pi Agent (`@earendil-works/pi-coding-agent`), implementing zero-shot ledger-based self-orchestration with in-memory fresh context isolation, deterministic anti-looping guards, and universal cut-off summarizers.
* **[DECISION] Package Identity & Boundary**: 
  The workspace root is canonicalized as `C:\dev\pi-gvs5h` following the `ai_monorepo_scaffold` tri-language topology (`apps/`, `crates/`, `node/`, `python/`, `tools/`, `configs/`, `docs/`, `tmp/`). 
  The active extension package physically lives in `node/packages/core` and is linked globally into Pi via `~/.pi/agent/settings.json` pointing to `C:\dev\pi-gvs5h\node\packages\core`. 
  The old scratchpad directory (`C:\dev\gvs5h`) has been fully superseded and pruned.

---

## 2. Current Mission

* **[FACT] Mission Statement**: Transform the GVS5H paper's theoretical framework (arXiv:2608.26480) into an industrial-grade, fully deterministic, zero-token-waste coding harness for local reasoning models (27B–35B parameter class with active Chain-of-Thought reasoning), capable of autonomously solving real-world repository defects without infinite exploration loops or context degradation.

---

## 3. Current Objective

* **[FACT] CURRENT OBJECTIVE**:
  Consolidate the hardened GVS5H harness in the standard Monorepo layout, strictly maintaining the boundary between universal zero-shot orchestration and instance-specific overfitting, and leveraging the fast validation suite (`selftest` / `runner-selftest`) to prevent unmetered inference waste.

---

## 4. Next Single Action

* **[DECISION] NEXT SINGLE ACTION**:
  When resuming or extending the harness:
  1. Confirm unit test baseline: `pnpm --dir node/packages/core test` (must remain 20/20 PASS);
  2. Confirm grader and runner integrity: `node tools/validation/selftest.mjs && node tools/validation/runner-selftest.mjs` (must remain 100% PASS);
  3. For instance generalization experiments (such as crash or layout bugs), analyze ledger transitions and token-efficiency without resorting to ad-hoc, instance-specific prompt overrides.

---

## 5. Current Scope

* **[FACT] Active Directory**: `C:\dev\pi-gvs5h`
* **[FACT] Active Files**:
  * `node/packages/core/src/pi-worker.ts`: Worker context isolation, role prompt contracts, universal cut-off summarizers.
  * `node/packages/core/src/workflow.ts`: State machine loop (`plan` → `ideate` → `manage` → `work` → `verify` → `review`).
  * `node/packages/core/src/config.ts`: Budgets, timeouts, role temperatures, and checks schema.
  * `node/packages/core/extensions/index.ts`: Pi extension command `/gvs` registration and event interception.
  * `tools/validation/run.mjs`: Monorepo-aware evaluation runner.
* **[FACT] Active Tests**:
  * `node/packages/core/tests/*.test.ts` (20 suites)
  * `tools/validation/selftest.mjs`
  * `tools/validation/runner-selftest.mjs`

---

## 6. Out of Scope

* **[DECISION] Strictly Prohibited**:
  * Do NOT add instance-specific string checks or conditional logic (`if (instance === "ox-alpha")`) into `node/packages/core/src/`.
  * Do NOT modify unit test assertions in `node/packages/core/tests/` (these represent regression bounds).
  * Do NOT rewrite the extension in Python or Rust (Pi Agent host control plane is strictly Node.js/TypeScript).
  * Do NOT run unconstrained multi-million-token real-model runs when fast selftests can verify the target harness property in seconds.
  * Do NOT pollute root or `tools/` with redundant `node_modules` (rely on pnpm workspace boundaries).

---

## 7. Last Known Good State

* **[FACT] Timestamp**: 2026-09-30T15:00:00Z
* **[FACT] Environment**: Windows 11, Node.js v24.18.0, pnpm v11.13.1, Pi v0.87.1, llama-server 127.0.0.1:8080 (Ornith 35B MoE MTPv2).
* **[FACT] Unit Test Status**:
  ```text
  Command: pnpm --dir node/packages/core test
  Output:
  ℹ tests 20
  ℹ suites 0
  ℹ pass 20
  ℹ fail 0
  ℹ duration_ms 1597.7102
  ```
* **[FACT] Grader Selftest Status**:
  ```text
  Command: node tools/validation/selftest.mjs
  Output: grader expectations hold (All 3 instances pass reference-fix and reject cheats)
  ```
* **[FACT] Runner Selftest Status**:
  ```text
  Command: node tools/validation/runner-selftest.mjs
  Output: runner expectations hold (Fresh sessions, ledger capture, patch attribution, review verdicts verified)
  ```
* **[FACT] Ground-Truth Real Model Benchmark Status (`qwen-next-speed-cap`)**:
  ```text
  Command: node tools/validation/run.mjs --instance qwen-next-speed-cap --arm gvs --provider local-llama --model local-models
  Result:
  PASS  qwen-next-speed-cap  arm=gvs
  tokens=563635 steps=1 workflow=completed files=1 failures=0
  Checks: 8/8 PASSED (100%)
  - Peak speed clamped at exactly 265.0 px/s (hard clamp applied in src/player.js:76)
  - Authored moveSpeed:265 preserved
  - All 6 levels verified intact via tools/validate_levels.js
  - Token consumption reduced by 20.3% compared to baseline prototype
  ```

---

## 8. Architectural Audit & Golden Standard Alignment

* **Comparison with Upstream (`srossitto79/pi-gvs5h`)**:
  * *Valid Hardening*: Universal Cut-off Summarizers (`summarizePlan`, `summarizeIdeate`) eliminate the upstream author's fatal flaw of discarding 150k research tokens via unhandled `throw Error` on turn cap.
  * *Over-engineering Check*: Upstream designed validation instances as comparative benchmarks between `plain` and `gvs` arms, not as prompts to be hyper-tuned. We halted instance-specific prompt fiddling to preserve true Zero-Shot generalizability.
* **Comparison with Paper (`slee-persis/GVS5H` arXiv:2608.26480)**:
  * Aligned the three core pillars: Fresh Context Isolation (`SessionManager.inMemory()`), Universal Summarizer Fallback, and Actionable Task Curation (investigation completes in Plan/Ideate; Work strictly modifies code; Manager applies Fix-or-Switch).

---

## 9. Invariants

1. **Session Disposal**: Every worker execution MUST terminate with `session.dispose()` in a `finally` block.
2. **Zero-Tool Interception**: Standard prompts and user commands MUST be blocked while GVS runs.
3. **Ledger Immutability**: Writes to `.pi/gvs/run.json` MUST use temporary UUID files and atomic `rename`.
4. **Independent Review**: Code completions MUST pass independent review before status is marked `"completed"`.
5. **Supply Chain Policy**: `pnpm-workspace.yaml` MUST retain `allowBuilds` for native packages (`@google/genai`, `esbuild`, `protobufjs`).
6. **Test Baseline**: All 20 unit tests in `node/packages/core` MUST pass with zero failures at all times.

---

## 10. Reproducibility Status

```text
STATUS: FULLY REPRODUCIBLE

Justification:
1. Workspace topology strictly conforms to Tri-Language Monorepo constitutional rules.
2. 20/20 unit tests execute deterministically in 1.6 seconds.
3. Grader and runner selftest suites pass in under 2 seconds with 0 token spend.
4. Ground-truth benchmark on qwen-next-speed-cap reproduced 8/8 passes with 0 failures and 563k tokens.
5. All physical paths, global Pi linkings, and dependencies verified functional on local host.
```
