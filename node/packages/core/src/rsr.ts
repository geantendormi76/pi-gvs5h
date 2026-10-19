/**
 * Recursive Self-Rewrite (RSR) Distiller & Trajectory Exporter
 * 
 * Inspired by Terminal-RSI (arXiv:2610.22192):
 * Extracts clean, verified patches from noisy trial-and-error runs
 * and exports gold-standard trajectory datasets for offline policy fine-tuning.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import type { Run } from "./types.ts";

const execFileAsync = promisify(execFile);

export interface DistilledRunbook {
  id: string;
  goal: string;
  steps: number;
  tokens: number;
  tasksCompleted: number;
  filesModified: string[];
  cleanPatch: string;
  summary: string;
  completedAt: string;
}

export interface TrajectoryRecord {
  version: 1;
  id: string;
  goal: string;
  plan: string;
  notes: string;
  steps: number;
  tokens: number;
  tokensByRole: Record<string, number>;
  tasks: Array<{ id: string; description: string; status: string; result: string }>;
  distilledRunbook: DistilledRunbook;
  checks: Array<{ name: string; passed: boolean }>;
  reviewVerdict: "pass" | "fail" | null;
  completedAt: string;
}

/**
 * Dynamically resolves the Monorepo workspace root by climbing ancestors.
 */
export function findMonorepoRoot(startDir: string): string | undefined {
  let curr = resolve(startDir);
  while (true) {
    if (existsSync(join(curr, "pnpm-workspace.yaml")) && existsSync(join(curr, "HANDOFF.md"))) {
      return curr;
    }
    const parent = dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return undefined;
}

/**
 * Safely captures working tree changes via git diff without modifying repository state.
 */
export async function captureGitDiff(cwd: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["diff", "HEAD"], { cwd, timeout: 5000 });
    if (stdout.trim()) return stdout.trim();
    const { stdout: diffCached } = await execFileAsync("git", ["diff", "--cached"], { cwd, timeout: 5000 });
    return diffCached.trim();
  } catch {
    return "";
  }
}

/**
 * Parses modified file paths from a unified git diff output.
 */
export function parseModifiedFiles(patch: string): string[] {
  if (!patch) return [];
  const files = new Set<string>();
  const regex = /^diff --git a\/(.+?) b\/(.+?)$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(patch)) !== null) {
    if (match[2]) files.add(match[2].trim());
  }
  return Array.from(files);
}

/**
 * Synthesizes a high-density, noise-free clean Runbook from a verified run.
 */
export function distillRunbook(run: Run, patch: string): DistilledRunbook {
  const filesModified = parseModifiedFiles(patch);
  const tasksCompleted = run.tasks.filter(t => t.status === "done").length;
  const filesStr = filesModified.length > 0 ? filesModified.join(", ") : "no-git-changes";
  const summary = `Goal: "${run.goal}" | Steps: ${run.steps} | Tasks Done: ${tasksCompleted} | Files: [${filesStr}] | Verdict: ${run.reviewVerdict ?? "verified"}`;

  return {
    id: run.id,
    goal: run.goal,
    steps: run.steps,
    tokens: run.tokens,
    tasksCompleted,
    filesModified,
    cleanPatch: patch,
    summary,
    completedAt: new Date().toISOString(),
  };
}

/**
 * Exports the verified run and clean runbook into the trajectory data flywheel.
 */
export async function exportTrajectory(cwd: string, run: Run): Promise<string | undefined> {
  try {
    const patch = await captureGitDiff(cwd);
    const distilled = distillRunbook(run, patch);

    const record: TrajectoryRecord = {
      version: 1,
      id: run.id,
      goal: run.goal,
      plan: run.plan,
      notes: run.notes,
      steps: run.steps,
      tokens: run.tokens,
      tokensByRole: run.tokensByRole as Record<string, number>,
      tasks: run.tasks.map(t => ({ id: t.id, description: t.description, status: t.status, result: t.result })),
      distilledRunbook: distilled,
      checks: run.checks.map(c => ({ name: c.name, passed: c.passed })),
      reviewVerdict: run.reviewVerdict,
      completedAt: distilled.completedAt,
    };

    const jsonlPayload = JSON.stringify(record) + "\n";

    // 1. 本地工作区目录落盘
    const localDir = join(cwd, ".pi", "gvs", "trajectories");
    await mkdir(localDir, { recursive: true });
    const localFile = join(localDir, `run_${run.id}.jsonl`);
    await writeFile(localFile, jsonlPayload, "utf8");

    // 2. 动态定位 Monorepo 顶层数据中心并落盘
    const monorepoRoot = findMonorepoRoot(cwd);
    if (monorepoRoot) {
      const monorepoDataDir = join(monorepoRoot, "data", "trajectories");
      await mkdir(monorepoDataDir, { recursive: true });
      await writeFile(join(monorepoDataDir, `run_${run.id}.jsonl`), jsonlPayload, "utf8");
    }

    return localFile;
  } catch {
    return undefined;
  }
}
