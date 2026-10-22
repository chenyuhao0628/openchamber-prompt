import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
execFileSync('node', ['scripts/build.mjs'], { stdio: 'inherit' });

const required = [
  'package.json',
  'panel/index.html',
  'panel/main.js',
  'panel/section.html',
  'panel/section.js',
  'README.md',
  'INSTALL.md',
];
const out = `dist/openchamber-prompt-${pkg.version}.zip`;
mkdirSync('dist', { recursive: true });
rmSync(out, { force: true });
execFileSync('zip', ['-q', '-r', out, ...required], { stdio: 'inherit' });

const listing = execFileSync('unzip', ['-l', out], { encoding: 'utf8' });
for (const name of required) {
  if (!listing.includes(name)) throw new Error(`打包结果缺少 ${name}`);
}
const sha = createHash('sha256').update(readFileSync(out)).digest('hex');
console.log(listing.trim());
console.log(`\nsha256 ${sha}`);
