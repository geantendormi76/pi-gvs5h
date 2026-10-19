/**
 * Turn-Boundary Observation Dehydrator (TBOD)
 * 
 * Inspired by Terminal-RSI (arXiv:2610.22192) skip-observation principle:
 * Sanitizes and folds verbose terminal observation logs (stdout/stderr)
 * to prevent KV Cache saturation and cognitive drift in LLM agents.
 */

// Comprehensive ANSI escape sequences stripper regex (CSI, OSC, SGR)
const ANSI_REGEX = new RegExp(
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
  'g'
);

const ERROR_LINE_REGEX = /(?:error(?:\[E\d+\])?|failed|fatal|panic|exception|traceback|assertionerror|segmentation fault|cannot find|undefined reference|permission denied)/i;

export interface DehydrateOptions {
  maxLines?: number;
  maxChars?: number;
  headLines?: number;
  tailLines?: number;
  maxMiddleErrors?: number;
}

const DEFAULT_BASH_OPTIONS: Required<DehydrateOptions> = {
  maxLines: 60,
  maxChars: 3000,
  headLines: 15,
  tailLines: 30,
  maxMiddleErrors: 8,
};

const DEFAULT_SEARCH_OPTIONS: Required<DehydrateOptions> = {
  maxLines: 80,
  maxChars: 4000,
  headLines: 40,
  tailLines: 10,
  maxMiddleErrors: 0,
};

/**
 * Strips all ANSI color and cursor escape codes from raw text.
 */
export function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, '');
}

/**
 * Dehydrates raw observation text based on the executing tool.
 */
export function dehydrateObservation(toolName: string, rawText: string, customOptions?: DehydrateOptions): string {
  if (!rawText) return rawText;

  // 1. Strip ANSI escape artifacts first
  const cleanText = stripAnsi(rawText);

  // 2. Do not truncate non-terminal file manipulation tools (read, write, edit)
  if (toolName === "read" || toolName === "write" || toolName === "edit") {
    return cleanText;
  }

  const isSearch = toolName === "grep" || toolName === "find";
  const opts = isSearch
    ? { ...DEFAULT_SEARCH_OPTIONS, ...customOptions }
    : { ...DEFAULT_BASH_OPTIONS, ...customOptions };

  const lines = cleanText.split('\n');

  // Within limits: pass through clean text without modification
  if (lines.length <= opts.maxLines && cleanText.length <= opts.maxChars) {
    return cleanText;
  }

  // 3. Perform Turn-Boundary Folding for Bash / Terminal outputs
  if (!isSearch) {
    const head = lines.slice(0, opts.headLines);
    const tail = lines.slice(-opts.tailLines);
    const middle = lines.slice(opts.headLines, -opts.tailLines);

    // Extract critical error lines from the middle stream
    const preservedErrors: string[] = [];
    for (const line of middle) {
      if (ERROR_LINE_REGEX.test(line)) {
        preservedErrors.push(line);
        if (preservedErrors.length >= opts.maxMiddleErrors) break;
      }
    }

    const omittedCount = middle.length - preservedErrors.length;
    const parts: string[] = [...head];

    if (omittedCount > 0) {
      parts.push(`\n[... TBOD: ${omittedCount} lines of non-critical compiler/process stream omitted ...]`);
    }

    if (preservedErrors.length > 0) {
      parts.push(`--- [TBOD Preserved Intermediate Failure Markers] ---`);
      parts.push(...preservedErrors);
      parts.push(`-----------------------------------------------------`);
    }

    parts.push(...tail);
    return parts.join('\n');
  }

  // 4. Perform Search Output Folding (grep / find)
  const head = lines.slice(0, opts.headLines);
  const tail = lines.slice(-opts.tailLines);
  const omittedCount = lines.length - opts.headLines - opts.tailLines;

  return [
    ...head,
    `\n[... TBOD: ${omittedCount} additional search results omitted. Refine query pattern ...]`,
    ...tail,
  ].join('\n');
}
