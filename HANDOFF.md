# AI Development Handoff Specification

## 0. Handoff Metadata

* **Specification Version**: 1.3.0 (Linux Mint 22.3 Native Migration & Golden Standard Aligned)
* **Generated At**: 2026-10-02T11:22:00Z
* **Workspace Root**: `/home/zhz/pi-gvs5h`
* **Node Core Package**: `/home/zhz/pi-gvs5h/node/packages/core`
* **Validation Harness**: `/home/zhz/pi-gvs5h/tools/validation`
* **Authoring Context**: AI System Architecture & Engineering Research Session
* **Reproducibility Rating**: FULLY REPRODUCIBLE (Tri-language monorepo topology confirmed, 20/20 unit tests pass, grader/runner selftests pass, ground-truth real-model benchmark verified).

---

## 1. Project Identity

* **[FACT] Project Name**: `pi-gvs5h` (derived and upgraded from `srossitto79/pi-gvs5h`, originating from arXiv:2608.26480v2 `GVS5H`).
* **[FACT] Project Nature**: A native TypeScript Extension Package for Pi Agent (`@earendil-works/pi-coding-agent`), implementing zero-shot ledger-based self-orchestration with in-memory fresh context isolation, deterministic anti-looping guards, and universal cut-off summarizers.
* **[DECISION] Package Identity & Boundary**: 
  The workspace root is canonicalized as `/home/zhz/pi-gvs5h` following the `ai_monorepo_scaffold` tri-language topology (`apps/`, `crates/`, `node/`, `python/`, `tools/`, `configs/`, `docs/`, `tmp/`). 
  The active extension package physically lives in `node/packages/core` and is linked globally into Pi via `~/.pi/agent/settings.json` pointing to `/home/zhz/pi-gvs5h/node/packages/core`. 
  The legacy Windows dev paths have been fully purged.

---

## 2. Current Mission

* **[FACT] Mission Statement**: Transform the GVS5H paper's theoretical framework (arXiv:2608.26480) into an industrial-grade, fully deterministic, zero-token-waste coding harness for local reasoning models (27B–35B parameter class with active Chain-of-Thought reasoning), capable of autonomously solving real-world repository defects without infinite exploration loops or context degradation.

---

## 3. Current Objective

* **[FACT] CURRENT OBJECTIVE**:
  Consolidate the hardened GVS5H harness in the standard Monorepo layout on Linux Mint, strictly maintaining the boundary between universal zero-shot orchestration and instance-specific overfitting, and leveraging the fast validation suite (`selftest` / `runner-selftest`) to prevent unmetered inference waste.

---

## 4. Next Single Action

* **[DECISION] NEXT SINGLE ACTION**:
  When resuming or extending the harness:
  1. Confirm unit test baseline: `pnpm --dir node/packages/core test` (must remain 20/20 PASS);
  2. Confirm grader and runner integrity: `node tools/validation/selftest.mjs && node tools/validation/runner-selftest.mjs` (must remain 100% PASS);
  3. Verify live Pi integration: launch `pi` and issue `/gvs help` to confirm command interception;
  4. For instance generalization experiments (such as crash or layout bugs), analyze ledger transitions and token-efficiency without resorting to ad-hoc, instance-specific prompt overrides.

---

## 5. Current Scope

* **[FACT] Active Directory**: `/home/zhz/pi-gvs5h`
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

* **[FACT] Timestamp**: 2026-10-02T11:22:00Z
* **[FACT] Environment**: Linux Mint 22.3 Cinnamon (x86_64), Node.js v24.21.0, pnpm v11.19.0, Pi v0.99.2+, llama-server 127.0.0.1:8080 (Ornith 35B MoE MTPv2 160K).
* **[FACT] Unit Test Status**:
  ```text
  Command: pnpm --dir node/packages/core test
  Output:
  ℹ tests 20
  ℹ suites 0
  ℹ pass 20
  ℹ fail 0
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

---

## 8. Invariants

1. **Session Disposal**: Every worker execution MUST terminate with `session.dispose()` in a `finally` block.
2. **Zero-Tool Interception**: Standard prompts and user commands MUST be blocked while GVS runs.
3. **Ledger Immutability**: Writes to `.pi/gvs/run.json` MUST use temporary UUID files and atomic `rename`.
4. **Independent Review**: Code completions MUST pass independent review before status is marked `"completed"`.
5. **Supply Chain Policy**: `pnpm-workspace.yaml` MUST retain `allowBuilds` for native packages (`@google/genai`, `esbuild`, `protobufjs`).
6. **Test Baseline**: All 20 unit tests in `node/packages/core` MUST pass with zero failures at all times.
