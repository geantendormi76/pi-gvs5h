# pi-gvs5h

基于 **arXiv:2608.26480**（GVS5H）理论与 **Pi Agent**（`@earendil-works/pi-coding-agent`）生态构建的工业级确定性自主编程编排框架（Zero-Shot Ledger-Based Self-Orchestration Harness）。

本项目将学术界在单文件算法竞赛题上的“基于账本的自编排”架构，全面升级为能够驱动本地中端推理模型（27B–35B 参数级，含长思维链）在多文件真实复杂代码库中自主排查、修改与验证缺陷的通用 Harness。

---

## 核心架构与设计哲学

系统通过四大物理级工程闭环，彻底根除传统单会话 Agent 的注意力漂移、长上下文衰减与死循环重试缺陷：

1. **物理级上下文湮灭（Fresh In-Memory Context Isolation）**：
   每个工作流阶段（Plan ➜ Ideate ➜ Manage ➜ Work ➜ Review）均通过 `SessionManager.inMemory()` 动态拉起全新的内存 Agent 会话，在 `finally` 块中严格执行 `session.dispose()`，从物理层抹除历史 KV 缓存，杜绝注意力退化。
2. **黑板账本中枢（Durable Blackboard Ledger）**：
   通过 `.pi/gvs/run.json` 实现原子持久化（`.tmp` + `fs.rename`）与跨会话状态沉淀，通过 PID 探测防范锁并发与崩溃死锁。
3. **三大硬化防线（The 3 Hardened Pillars）**：
   - **全角色截断兜底（Universal Cut-off Summarizers）**：修复原作者非编辑角色超时直接抛错的死循环缺陷，在步数/Token 达到上限时通过小成本轻量调用抢救出结构化任务与见解。
   - **渐进式预警刹车（Progressive Steer Warnings）**：75% 预算阈值时注入系统指令，命令模型停笔收网并交付 `gvs_report`。
   - **角色契约与测试兼容**：Plan/Ideate 负责定位并产出可执行任务，Work 角色严格执行代码修改，严禁纯只读打转。
4. **确定性门禁与独立盲审（Zero-Trust Gate）**：
   Worker 自身无权声明任务完成；代码修改后必须通过配置的物理测试（`checks`）；通过后交由独立、只读的 Review 角色审阅 diff，审阅通过方可宣告完成。

---

## 仓库结构 (Monorepo Topology)

本项目严格遵循 AI 母仓库规范（三语言职责物理隔离）：

```text
C:\dev\pi-gvs5h\
├── node/                     # Node.js / TypeScript 工程域 (Agent Harness & Extension)
│   └── packages/
│       └── core/             # @pi-gvs5h/core 核心实现与 Pi 扩展入口
│           ├── extensions/   # extensions/index.ts (注册 /gvs 指令)
│           ├── src/          # workflow.ts, pi-worker.ts, ledger.ts, config.ts
│           └── tests/        # 20 项端到端及单元测试 (RPC, SDK 隔离, 状态机, 迁移)
├── tools/
│   ├── validation/           # 真实仓库打靶套件与判分器 (SWE-bench 风格靶场)
│   │   ├── instances/        # 评测实例 (qwen-next, ox-alpha, lodestar)
│   │   ├── lib/              # 零依赖 Node VM 浏览器沙箱驱动
│   │   ├── selftest.mjs      # 0 成本沙箱判分器自测套件
│   │   ├── runner-selftest.mjs # 0 成本本地伪模型运行器调度自测
│   │   └── run.mjs           # 评测运行器 (支持 plain arm 与 gvs arm 对照)
│   └── repomix/              # 跨会话工程交接打包配置
├── apps/                     # Desktop / UI 边界 (Tauri + React，与 Harness 物理隔离)
├── crates/                   # Rust 工作区 (底层系统能力储备)
├── python/                   # Python / uv 工作区 (科学计算与模型评估储备)
├── configs/                  # 声明式配置注入层
├── docs/                     # 架构文档与学术理论依据
├── HANDOFF.md                # 权威跨会话交接档案 (Single Source of Truth)
├── pnpm-workspace.yaml       # 工作区配置 (严格管理 allowBuilds 原生构建策略)
└── package.json
```

---

## 安装与快速开始

### 1. 环境要求
- Node.js >= 22.18.0
- pnpm >= 11.13.0
- Pi Agent (`@earendil-works/pi-coding-agent`)

### 2. 本地链接至 Pi
将核心包全局链接到你的 Pi 环境：

```powershell
# 1. 安装依赖
pnpm install

# 2. 挂载扩展到 Pi
cd node/packages/core
pi install -l .
```

*核验挂载状态*：检查 `~/.pi/agent/settings.json` 的 `"packages"` 中已包含当前绝对路径 `"C:\\dev\\pi-gvs5h\\node\\packages\\core"`。

### 3. 在项目中使用
在需要进行自主编码的任何目标项目目录下：

```text
# 1. 初始化配置 (生成 .pi/gvs.json)
/gvs init

# 2. 启动自主编码工作流
/gvs 修复登录表单在密码重置时的校验失效缺陷
```

#### 常用指令

| 指令 | 作用 |
| :--- | :--- |
| `/gvs <goal>` | 以当前选定的模型与思考预算启动自编排工作流 |
| `/gvs status` | 查看当前账本状态、步骤进度、Token 消耗与交接报告 |
| `/gvs plan` | 查看已拆解的任务清单与执行状态 |
| `/gvs resume` | 在中断或调整配置后，从账本最新快照断点续跑 |
| `/gvs cancel` | 安全终止当前工作流（保留代码修改与账本） |
| `/gvs reset` | 归档当前账本，准备执行新的目标 |

---

## 验证与测试体系

系统内置严格的三层测试金字塔，确保修改零回归：

### 第 1 层：核心单元测试与契约回归 (耗时 ~1.6s)
覆盖 RPC 发现、真机文件修改、会话隔离、截断挽救、防死循环熔断等全部 20 组测试：

```powershell
pnpm --dir node/packages/core test
```

### 第 2 层：零成本沙箱与调度器自测 (耗时 < 2s，0 Token)
在不消耗任何模型 Token 的前提下，验证所有靶场的 Grader 防作弊拦截，并通过本地 Fake Model 验证全流程调度与账本捕获：

```powershell
cd tools/validation
node selftest.mjs
node runner-selftest.mjs
```

### 第 3 层：真实模型真机基准打靶
驱动本地推理模型（如 `llama-server` 搭载 35B 模型）在真实靶场上进行科学对照打靶：

```powershell
cd tools/validation

# 1. 验证原始代码缺陷存在 (耗费 0 Token)
node run.mjs --instance qwen-next-speed-cap --arm none

# 2. 驱动 GVS 自主修复并评测
node run.mjs --instance qwen-next-speed-cap --arm gvs --provider local-llama --model local-models
```

*实测战报*：在 `qwen-next-speed-cap` 靶场上达成 **8/8 项物理检查 100% 通过、1 步外科手术修复、0 failure、563k tokens（较初始版本节省 20.3%）**。

---

## 生产落地指导原则

1. **门禁先行**：GVS 必须依赖客观的命令判定。请在 `.pi/gvs.json` 中的 `checks` 数组配置可靠的测试命令（如 `npm test`、`pytest` 等）。
2. **预算配置**：在 27B–35B 开启长思维链推理时，单步 Token 消耗较大，建议保持单步 `maxWorkerTokens: 150000`、整轮 `maxSteps: 8`，以达到最优性价比。
3. **交接即产物**：面对复杂未知难题，当触发 `maxRepeats` 防死循环熔断时，GVS 沉淀的 `handoff` 报告能精准输出崩溃点与修复建议，为人工介入提供详尽依据。

---

## 致谢与引用

- **GVS5H 论文**：[Zero-Shot Self-Orchestration with Ledger-Based Control Improves Coding in Language Models (arXiv:2608.26480)](https://arxiv.org/abs/2608.26480)
- **原型开源库**：[srossitto79/pi-gvs5h](https://github.com/srossitto79/pi-gvs5h) 与 [slee-persis/GVS5H](https://github.com/slee-persis/GVS5H)
- **宿主 Agent 框架**：[Pi Agent (@earendil-works/pi-coding-agent)](https://github.com/earendil-works/pi)
