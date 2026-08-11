/**
 * After `tsc`, copy the generated poseRuntimeSource into lib/
 * (excluded from TypeScript compile).
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src/backends/webview');
const libDir = join(root, 'lib/backends/webview');

const files = ['poseRuntimeSource.js', 'poseRuntimeSource.d.ts'];
for (const name of files) {
  const from = join(srcDir, name);
  if (!existsSync(from)) {
    console.error(`Missing ${from}. Run: npm run embed:runtime`);
    process.exit(1);
  }
}
mkdirSync(libDir, { recursive: true });
for (const name of files) {
  copyFileSync(join(srcDir, name), join(libDir, name));
}
console.log('copied poseRuntimeSource → lib/backends/webview/');
