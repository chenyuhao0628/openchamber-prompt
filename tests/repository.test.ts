import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository, parseState } from '../src/core/repository.ts';
import { BACKUP_DIR, ConflictError, STATE_PATH, STUB, TARGET_PATH } from '../src/core/types.ts';

class MemoryFiles {
  data = new Map<string, string>();
  async read(path: string): Promise<string | null> { return this.data.get(path) ?? null; }
  async write(path: string, content: string): Promise<void> { this.data.set(path, content); }
  async list(path: string): Promise<string[]> {
    const prefix = `${path.replace(/\/$/, '')}/`;
    return [...this.data.keys()]
      .filter(key => key.startsWith(prefix))
      .map(key => key.slice(prefix.length))
      .filter(name => !name.includes('/'))
      .sort();
  }
}

const setup = () => {
  const files = new MemoryFiles();
  files.data.set(TARGET_PATH, STUB);
  let tick = 0;
  let serial = 0;
  const repo = createRepository(
    files,
    () => 1_700_000_000_000 + ++tick,
    () => `00000000-0000-4000-8000-${String(++serial).padStart(12, '0')}`,
  );
  return { files, repo };
};

test('初始 stub 识别为内置状态', async () => {
  const { repo } = setup();
  const loaded = await repo.load();
  assert.equal(loaded.status, 'builtin');
  assert.equal(loaded.state, null);
});

test('应用覆盖会写文件、建备份并记录状态', async () => {
  const { files, repo } = setup();
  const loaded = await repo.load();
  const review = await repo.reviewApply(loaded, 'You are a test prompt.');
  assert.match(review.content, /^---\nmode: all\n---\n\nYou are a test prompt\.\n$/);
  const next = await repo.apply(loaded, review);
  assert.equal(next.status, 'applied');
  assert.equal(files.data.get(TARGET_PATH), review.content);
  assert.ok(next.state);
  assert.equal(next.state.baseline.content, STUB);
  assert.equal(next.state.applied.content, review.content);
  assert.equal(await repo.listBackups().then(items => items.length), 1);
});

test('还原会写回基线 stub', async () => {
  const { files, repo } = setup();
  const loaded = await repo.load();
  const applied = await repo.apply(loaded, await repo.reviewApply(loaded, 'Override body.'));
  const review = await repo.reviewRestore(applied);
  assert.equal(review.content, STUB);
  const restored = await repo.apply(applied, review);
  assert.equal(restored.status, 'builtin');
  assert.equal(files.data.get(TARGET_PATH), STUB);
});

test('外部修改后进入 drifted，并拒绝无重新预览的写入', async () => {
  const { files, repo } = setup();
  const loaded = await repo.load();
  const review = await repo.reviewApply(loaded, 'First body.');
  const applied = await repo.apply(loaded, review);
  files.data.set(TARGET_PATH, 'external edit');
  const drifted = await repo.load();
  assert.equal(drifted.status, 'drifted');
  await assert.rejects(() => repo.apply(applied, review), ConflictError);
});

test('状态文件被外部修改时拒绝应用', async () => {
  const { files, repo } = setup();
  const loaded = await repo.load();
  const review = await repo.reviewApply(loaded, 'Body.');
  files.data.set(STATE_PATH, JSON.stringify({ version: 1, baseline: { exists: true, content: STUB }, applied: { exists: true, content: 'other' }, appliedAt: 1, baselineLabel: 'x' }));
  await assert.rejects(() => repo.apply({ ...loaded, stateRaw: null }, review), ConflictError);
});

test('备份可以预览并恢复', async () => {
  const { files, repo } = setup();
  const first = await repo.apply(await repo.load(), await repo.reviewApply(await repo.load(), 'First body.'));
  const second = await repo.apply(first, await repo.reviewApply(first, 'Second body.'));
  assert.equal(second.status, 'applied');
  const ids = await repo.listBackups();
  assert.equal(ids.length, 2);
  const review = await repo.reviewBackup(ids[0]);
  assert.equal(review.content, '---\nmode: all\n---\n\nFirst body.\n');
  const restored = await repo.apply(second, review);
  assert.equal(files.data.get(TARGET_PATH), '---\nmode: all\n---\n\nFirst body.\n');
  assert.equal(restored.status, 'applied');
});

test('无状态文件时从外部修改还原，基线应记为 stub', async () => {
  const { files, repo } = setup();
  files.data.set(TARGET_PATH, 'external content');
  const loaded = await repo.load();
  assert.equal(loaded.status, 'drifted');
  const restored = await repo.apply(loaded, await repo.reviewRestore(loaded));
  assert.equal(restored.status, 'builtin');
  assert.equal(restored.state?.baseline.content, STUB);
  assert.equal(files.data.get(TARGET_PATH), STUB);
});

test('无状态文件时应用覆盖，基线保留原外部内容', async () => {
  const { files, repo } = setup();
  files.data.set(TARGET_PATH, 'external content');
  const loaded = await repo.load();
  const applied = await repo.apply(loaded, await repo.reviewApply(loaded, 'Override.'));
  assert.equal(applied.status, 'applied');
  assert.equal(applied.state?.baseline.content, 'external content');
  const restored = await repo.apply(applied, await repo.reviewRestore(applied));
  assert.equal(restored.status, 'baseline');
  assert.equal(files.data.get(TARGET_PATH), 'external content');
});

test('损坏的状态文件不会静默重置', async () => {
  assert.throws(() => parseState('{'), /状态文件格式有误/);
  assert.throws(() => parseState(JSON.stringify({ version: 2 })), /状态文件格式有误/);
});

test('备份目录过滤非备份文件', async () => {
  const { files, repo } = setup();
  files.data.set(`${BACKUP_DIR}/not-a-backup.json`, '{}');
  files.data.set(`${BACKUP_DIR}/1700000000000-00000000-0000-4000-8000-000000000001.json`, '{}');
  assert.deepEqual(await repo.listBackups(), ['1700000000000-00000000-0000-4000-8000-000000000001']);
});
