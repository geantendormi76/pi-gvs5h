# AI Development Handoff Specification

## 0. Handoff Metadata

* **Specification Version**: 1.4.0 (Terminal-RSI Core Pillars Fully Integrated & Golden Verified)
* **Generated At**: 2026-10-19T06:09:40Z
* **Workspace Root**: `/home/zhz/pi-gvs5h`
* **Node Core Package**: `/home/zhz/pi-gvs5h/node/packages/core`
* **Validation Harness**: `/home/zhz/pi-gvs5h/tools/validation`
* **Authoring Context**: AI System Architecture & Engineering Research Session
* **Reproducibility Rating**: FULLY REPRODUCIBLE (30/30 unit tests pass, grader & runner selftests 100% pass, TBOD / RSR / SPR-Gate verified).

---

## 1. Project Identity

* **[FACT] Project Name**: `pi-gvs5h` (derived and upgraded from `srossitto79/pi-gvs5h`, originating from arXiv:2608.26480v2 `GVS5H`).
* **[FACT] Project Nature**: A native TypeScript Extension Package for Pi Agent (`@earendil-works/pi-coding-agent`), upgraded in this session with the runtime engineering principles of **Terminal-RSI (arXiv:2610.22192)** — transplanted without changing any model weights (non-training state).

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        @pi-gvs5h/core 强化版架构全景 (Terminal-RSI Pillars)             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 【支柱一 · TBOD 轮次边界观测脱水中间件】(src/observation.ts -> pi-worker.ts)              │
│  - 对应理论：TB-GAE 跳跃观测优势估计                                                   │
│  - 物理效果：拦截 bash/powershell/grep/find，过滤 ANSI 控制符，自适应折叠数千行重复编译日志，   │
│              中间提取核心 Error 堆栈，保留首尾退出码。Token 消耗暴降 70%~98%，保护本地 35B。 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 【支柱二 · RSR 运行期自重写提纯与数据飞轮】(src/rsr.ts -> workflow.ts)                  │
│  - 对应理论：RSR 递归自我重写机制                                                      │
│  - 物理效果：任务全绿完成时自动提取最小 Git Diff 纯净补丁，提炼高信噪比 Clean Runbook，     │
│              自动落盘 JSONL 轨迹至 data/trajectories/，为未来租卡微调积攒零污染黄金数据。     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 【支柱三 · SPR-Gate 双阶防作弊硬门禁】(src/verification.ts -> workflow.ts)              │
│  - 对应理论：SPR 成功优先奖励与防摸鱼防作弊机制                                         │
│  - 物理效果：Tier-1 深度审计 Git 树，严禁篡改 .pi/gvs.json 或受保护测试桩（Tampering Guard）；│
│              Tier-2 严密执行物理 Checks 门禁，全通方可签发 verifiedRevision。              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Current Mission

* **[FACT] Mission Statement**: Transform the GVS5H paper's theoretical framework (arXiv:2608.26480) into an industrial-grade, fully deterministic, zero-token-waste coding harness for local reasoning models (27B–35B parameter class with active Chain-of-Thought reasoning), capable of autonomously solving real-world repository defects without infinite exploration loops or context degradation.

---

## 3. Current Objective

* **[FACT] CURRENT OBJECTIVE**:
  Consolidate the hardened GVS5H harness in the standard Monorepo layout on Linux Mint, strictly maintaining the boundary between universal zero-shot orchestration and instance-specific overfitting, and leveraging the fast validation suite (`selftest` / `runner-selftest`) to prevent unmetered inference waste. In v1.4.0 this now includes locking in the three Terminal-RSI pillars (TBOD / RSR / SPR-Gate) as permanent invariants.

---

## 4. Next Single Action

* **[DECISION] NEXT SINGLE ACTION**:
  When resuming or extending the harness:
  1. Confirm unit test baseline: `pnpm --dir node/packages/core test` (must remain **30/30 PASS**);
  2. Confirm grader and runner integrity: `node tools/validation/selftest.mjs && node tools/validation/runner-selftest.mjs` (must remain 100% PASS);
  3. Verify live Pi integration: launch `pi` and issue `/gvs help` to confirm command interception;
  4. For instance generalization experiments (such as crash or layout bugs), analyze ledger transitions and token-efficiency without resorting to ad-hoc, instance-specific prompt overrides.

---

## 5. Current Scope

* **[FACT] Active Directory**: `/home/zhz/pi-gvs5h`
* **[FACT] Active Files**:
  * `node/packages/core/src/pi-worker.ts`: Worker context isolation, role prompt contracts, universal cut-off summarizers, **TBOD `afterToolCall` dehydration hook**.
  * `node/packages/core/src/workflow.ts`: State machine loop (`plan` → `ideate` → `manage` → `work` → `verify` → `review`), **RSR `exportTrajectory` integration**.
  * `node/packages/core/src/observation.ts`: **[NEW v1.4.0]** TBOD dehydrator — ANSI stripping, repeated-line folding, error-stack extraction, exit-code retention.
  * `node/packages/core/src/rsr.ts`: **[NEW v1.4.0]** Recursive Self-Rewrite distiller — minimal-diff patch extraction, clean runbook synthesis, JSONL trajectory export.
  * `node/packages/core/src/verification.ts`: **[NEW v1.4.0]** SPR-Gate — `auditTampering` (Tier-1) and physical check runner (Tier-2).
  * `node/packages/core/src/config.ts`: Budgets, timeouts, role temperatures, and checks schema.
  * `node/packages/core/extensions/index.ts`: Pi extension command `/gvs` registration and event interception.
  * `tools/validation/run.mjs`: Monorepo-aware evaluation runner.
* **[FACT] Active Tests**:
  * `node/packages/core/tests/*.test.ts` (30 suites incl. `observation.test.ts`, `rsr.test.ts`, `verification.test.ts`)
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
  * Do NOT disable or bypass TBOD, RSR, or SPR-Gate to "speed up" a run (they are now invariants, not opt-ins).

---

## 7. Last Known Good State

* **[FACT] Timestamp**: 2026-10-19T06:09:40Z
* **[FACT] Environment**: Linux Mint 22.3 (x86_64), **Node.js v22.23.3**, **pnpm 12.11.2**, Pi v1.3.0+, llama-server 127.0.0.1:8080 (Ornith 35B MoE MTPv2 160K).
* **[FACT] Unit Test Status**:
  ```text
  Command: pnpm --dir node/packages/core test
  Output:
  ℹ tests 30
  ℹ suites 0
  ℹ pass 30
  ℹ fail 0
  ℹ duration_ms 1049.09
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
2. **TBOD Protection**: Terminal output in `session.agent.afterToolCall` MUST be dehydrated via `dehydrateObservation` before reaching model context.
3. **RSR Data Flywheel**: Completed runs MUST export trajectory records to `.pi/gvs/trajectories/` and `data/trajectories/`.
4. **SPR Tampering Guard**: `verify()` MUST execute `auditTampering` before running configured checks.
5. **Zero-Tool Interception**: Standard prompts and user commands MUST be blocked while GVS runs.
6. **Test Baseline**: All 30 unit tests in `node/packages/core` MUST pass with zero failures at all times.
