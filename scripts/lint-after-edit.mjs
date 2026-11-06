import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, isAbsolute } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// Read event JSON as data. Never execute text from the event or from edited files.
let event;
try {
  event = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.stderr.write('Invalid Codex hook event JSON.\n');
  process.exit(2);
}
if (event.hook_event_name && event.hook_event_name !== 'PostToolUse') process.exit(0);
const tool = event.tool_name ?? '';
if (!/^(Bash|exec_command|apply_patch|Edit|Write)$/.test(tool)) process.exit(0);
const changed = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], {
  cwd: root,
  encoding: 'utf8',
});
if (changed.status !== 0) {
  process.stderr.write('Cannot inspect project changes.\n');
  process.exit(2);
}
const files = changed.stdout
  .split('\0')
  .filter(Boolean)
  .map((line) => line.slice(3))
  .filter((path) => /\.(?:[cm]?js|jsx|ts|tsx)$/.test(path) && existsSync(join(root, path)));
const candidates = [...new Set(files)].filter((path) => {
  const rel = relative(root, join(root, path));
  return !rel.startsWith('..') && !isAbsolute(rel);
});
// Include staged, unstaged, and untracked code. Hash content so repeated read-only calls are cheap.
const hash = createHash('sha256');
for (const path of candidates.sort()) {
  hash.update(path);
  hash.update(readFileSync(join(root, path)));
}
for (const path of ['eslint.config.mjs', 'package-lock.json'])
  if (existsSync(join(root, path))) hash.update(readFileSync(join(root, path)));
const signature = hash.digest('hex');
const cacheDir = join(root, '.codex', '.cache'),
  stamp = join(cacheDir, 'eslint-success');
if (existsSync(stamp) && readFileSync(stamp, 'utf8') === signature) process.exit(0);
if (!candidates.length) process.exit(0);
const eslint = join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!existsSync(eslint)) {
  process.stderr.write('Install project dependencies before ESLint hook checks.\n');
  process.exit(2);
}
const result = spawnSync(process.execPath, [eslint, '--max-warnings=0', '--', ...candidates], {
  cwd: root,
  encoding: 'utf8',
  timeout: 45000,
});
if (result.status !== 0) {
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: 'ESLint 檢查未通過。',
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: (result.stdout + result.stderr).slice(0, 7000),
      },
    }),
  );
  process.exit(0);
}
mkdirSync(cacheDir, { recursive: true });
writeFileSync(stamp, signature);
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: `ESLint 已檢查 ${candidates.length} 個變動程式檔，沒有錯誤或警告。`,
    },
  }),
);
