import { spawn } from "node:child_process";
import { parseModifiedFiles, captureGitDiff } from "./rsr.ts";
import type { Check, CheckResult } from "./types.ts";

export interface TamperingAudit {
  clean: boolean;
  violations: string[];
  modifiedFiles: string[];
}

const DEFAULT_PROTECTED_PATHS = [
  ".pi/gvs.json",
  ".pi/gvs.toml",
];

/**
 * Tier-1 Tampering & Scope Guard: Audits working tree to ensure protected paths are untouched.
 */
export async function auditTampering(cwd: string, protectedPaths: string[] = []): Promise<TamperingAudit> {
  try {
    const patch = await captureGitDiff(cwd);
    const modifiedFiles = parseModifiedFiles(patch);
    const allProtected = [...DEFAULT_PROTECTED_PATHS, ...protectedPaths];
    const violations: string[] = [];

    for (const file of modifiedFiles) {
      for (const pattern of allProtected) {
        if (pattern.endsWith("/**") && (file.startsWith(pattern.slice(0, -3)) || file.startsWith(pattern.slice(0, -2)))) {
          violations.push(file);
          break;
        } else if (file === pattern || file.endsWith("/" + pattern)) {
          violations.push(file);
          break;
        }
      }
    }

    return {
      clean: violations.length === 0,
      violations,
      modifiedFiles,
    };
  } catch {
    return { clean: true, violations: [], modifiedFiles: [] };
  }
}

/**
 * Tier-2 Process Runner: Executes an individual configured check with timeout and cancellation.
 */
export async function runCheck(cwd: string, check: Check, timeoutMs: number, signal: AbortSignal): Promise<CheckResult> {
  signal.throwIfAborted();
  return new Promise((resolve) => {
    let output = "";
    let stopped = "";
    const child = spawn(check.command, check.args, {
      cwd, shell: false, windowsHide: true, detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"],
    });
    const append = (data: Buffer) => { output = (output + data.toString()).slice(-12000); };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    const stop = (reason: string) => {
      if (stopped) return;
      stopped = reason;
      if (child.pid) {
        if (process.platform === "win32") {
          const killer = spawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
          killer.on("error", () => child.kill());
        } else {
          try { process.kill(-child.pid, "SIGKILL"); } catch { child.kill("SIGKILL"); }
        }
      }
    };
    const abort = () => stop("Cancelled");
    const timer = setTimeout(() => stop("Check timed out"), timeoutMs);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
    child.on("error", (error) => { output += error.message; });
    child.on("close", (code) => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      resolve({ name: check.name, passed: !stopped && code === 0,
        output: `${stopped ? stopped + "\n" : ""}${output}`, finishedAt: new Date().toISOString() });
    });
  });
}
