# pi-gvs5h

基于 **arXiv:2608.26480**（GVS5H）理论与 **Pi Agent**（`@earendil-works/pi-coding-agent`）生态构建的确定性自主编程编排扩展（Ledger-Based Self-Orchestration Extension）。

通过内存级会话隔离（Fresh Context Isolation）、黑板账本原子持久化（Durable Blackboard Ledger）与全角色截断保底（Universal Cut-off Summarizers），使本地中端推理模型（27B–35B）在面对真实仓库缺陷时，能够自主完成“规划 ➜ 探查 ➜ 调度 ➜ 改码 ➜ 验证 ➜ 盲审”的闭环，杜绝上下文退化与死循环。

---

## 真实仓库结构

本项目采用多包工作区（Workspace）管理，所有核心逻辑与验证工具严格归位：

```text
C:\dev\pi-gvs5h\
├── node/
│   └── packages/
│       └── core/                 # @pi-gvs5h/core：核心引擎与 Pi 扩展
│           ├── extensions/       # index.ts（注册 /gvs 指令，拦截宿主事件）
│           ├── src/              # workflow.ts, pi-worker.ts, ledger.ts, config.ts, verification.ts
│           ├── tests/            # 20 项端到端及单元测试（RPC 握手、会话隔离、截断挽救、锁迁移）
│           └── package.json      # 声明 "pi": { "extensions": [...] } 与依赖
├── tools/
│   ├── validation/               # 真实仓库打靶套件（SWE-bench 风格基准测试）
│   │   ├── instances/            # 评测实例（qwen-next, ox-alpha, lodestar）
│   │   ├── lib/                  # 零依赖 Node VM 浏览器沙箱驱动
│   │   ├── selftest.mjs          # 0 成本沙箱判定器自测（验证 guards 与 reference-fix）
│   │   ├── runner-selftest.mjs   # 0 成本本地伪模型运行器全流程自测
│   │   └── run.mjs               # 评测运行器（支持 plain 与 gvs 双臂对照）
│   └── repomix/                  # 跨会话工程交接打包配置
├── docs/                         # 理论依据与学术文档
├── HANDOFF.md                    # 跨会话唯一权威交接档案
├── pnpm-workspace.yaml           # 工作区配置（管理 allowBuilds 原生构建白名单）
└── package.json                  # 工作区根配置
```

---

## 快速安装与使用

### 1. 安装依赖

```powershell
# 在仓库根目录安装工作区全部依赖
pnpm install
```

### 2. 挂载扩展至 Pi

将本扩展的核心包挂载进全局 Pi Agent 宿主：

```powershell
cd node/packages/core
pi install -l .
```

*核验方式*：检查 `~/.pi/agent/settings.json` 的 `"packages"` 列表中已包含：
`"C:\\dev\\pi-gvs5h\\node\\packages\\core"`

### 3. 在目标项目中运行

在任何需要自主修复缺陷的代码库根目录下：

```text
# 初始化配置（生成 .pi/gvs.json）
/gvs init

# 启动自主编码工作流
/gvs <你的修复目标>
```

常用控制指令：
- `/gvs status`：查看当前账本进度、步数、Token 消耗与交接摘要
- `/gvs plan`：查看已拆解的任务清单与状态
- `/gvs resume`：在中断或调整预算后，从账本最新快照断点续跑
- `/gvs cancel`：安全终止当前工作流（保留代码修改与账本）
- `/gvs reset`：归档当前账本，允许启动新目标

---

## 验证与测试体系

项目配备了严格的分层测试体系，验证修改时请优先使用低成本测试：

### 1. 核心单元测试（20/20 PASS，耗时 ~1.6 秒）
验证 RPC 指令注册、会话物理隔离、Universal Summarizer 截断保底、状态机流转与账本锁迁移：

```powershell
pnpm --dir node/packages/core test
```

### 2. 零 Token 快速沙箱自测（耗时 < 2 秒，0 成本）
在不启动真实 LLM 的前提下，验证各靶场判分器（Grader）的防作弊逻辑，并通过本地伪模型（Fake Model）测试运行器调度闭环：

```powershell
cd tools/validation
node selftest.mjs
node runner-selftest.mjs
```

### 3. 真实模型基准打靶
连接本地推理服务器（如 `llama-server` 127.0.0.1:8080）执行客观打靶验证：

```powershell
cd tools/validation

# 验证缺陷基线存在（花费 0 Token）
node run.mjs --instance qwen-next-speed-cap --arm none

# 启动 GVS 自主编排修复
node run.mjs --instance qwen-next-speed-cap --arm gvs --provider local-llama --model local-models
```

*实测战报*：在 `qwen-next-speed-cap` 靶场上达成 **8/8 项物理检查 100% 通过、1 步外科手术修改、0 failures、563k tokens（较原型节省 20.3%）**。

---

## 核心设计原则

1. **零特判，优先泛化**：禁止为特定题目或错误堆砌 `if` 特判，保持通用 Harness 契约。
2. **门禁先行**：系统依赖 `.pi/gvs.json` 中的 `checks` 实行客观验证；测试全绿后交由独立只读 Reviewer 盲审。
3. **截断挽救与交接**：单步超时触发 Universal Summarizer 挽救数据；反复无进展时触发 `maxRepeats` 熔断，生成详尽的 Hand-off 报告移交人工。
