export const roles = ["plan", "ideate", "manage", "work", "review", "finalize"] as const;
export type Role = (typeof roles)[number];
export type Status = "running" | "completed" | "cancelled" | "failed" | "paused";
export type TaskStatus = "pending" | "working" | "done" | "dropped";
export interface Task { id: string; description: string; status: TaskStatus; attempts: number; result: string }
export interface Check { name: string; command: string; args: string[] }
export interface Config {
  maxSteps: number;
  maxTokens: number;
  runTimeoutMs: number;
  checkTimeoutMs: number;
  maxWorkerTurns: number;
  maxWorkerTokens: number;
  maxRepeats: number;
  maxFailures: number;
  review: boolean;
  temperatures: Partial<Record<Role, number>>;
  checks: Check[];
  /** Optional list of protected file paths/patterns immune to agent modification */
  protectedPaths?: string[];
}
export interface CheckResult { name: string; passed: boolean; output: string; finishedAt: string }
export interface Run {
  version: 2;
  id: string;
  goal: string;
  status: Status;
  phase: Role;
  plan: string;
  notes: string;
  tasks: Task[];
  proposals: string[];
  steps: number;
  tokens: number;
  tokensByRole: Partial<Record<Role, number>>;
  revision: number;
  verifiedRevision: number | null;
  reviewedRevision: number | null;
  reviewVerdict: "pass" | "fail" | null;
  checks: CheckResult[];
  lastSummary: string;
  lastTaskId: string | null;
  repeats: number;
  failures: number;
  handoff: string;
  reason: string;
  updatedAt: string;
}
export interface TaskUpdate { id: string; status: TaskStatus }
export interface Report {
  summary: string;
  notes?: string;
  tasks?: string[];
  decision?: "work" | "done";
  taskId?: string;
  newTask?: string;
  newTasks?: string[];
  taskUpdates?: TaskUpdate[];
  verdict?: "pass" | "fail";
  incomplete?: boolean;
}
export interface WorkerRequest {
  role: Role;
  run: Run;
  task?: Task;
  guidance?: string;
  signal: AbortSignal;
  onTokens: (tokens: number) => void;
  onProgress: (text: string) => void;
}
export type Worker = (request: WorkerRequest) => Promise<Report>;
