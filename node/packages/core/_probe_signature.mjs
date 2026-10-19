import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. 穿透 pnpm 软链，获取真实包根目录
const entryUrl = import.meta.resolve('@earendil-works/pi-coding-agent');
const entryPath = fileURLToPath(entryUrl);
const realEntry = fs.realpathSync(entryPath);
const pkgDir = path.dirname(realEntry);

console.log('Real Package Path:', pkgDir);

// 2. 递归检索包含 afterToolCall 的 d.ts 文件
function searchDts(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') searchDts(full);
    } else if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('afterToolCall')) {
        console.log('\n--- FOUND IN:', full);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('afterToolCall')) {
            const start = Math.max(0, idx - 3);
            const end = Math.min(lines.length, idx + 8);
            console.log(lines.slice(start, end).join('\n'));
            console.log('⋮----------------------------------------');
          }
        });
      }
    }
  }
}

// 向上回溯到 .pnpm 里的包根目录扫描
searchDts(path.resolve(pkgDir, '..'));
