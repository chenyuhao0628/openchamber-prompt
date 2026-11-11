import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository, parseLibrary, parsePresets, parseState } from '../src/core/repository.ts';
import {
  BACKUP_DIR,
  ConflictError,
  LIBRARY_PATH,
  PRESETS_PATH,
  STATE_PATH,
  STUB,
  TARGET_PATH,
  composePrompt,
  estimateTokens,
  extractBody,
  extractMarkdownHeadings,
  matchedProfile,
} from '../src/core/types.ts';

class MemoryFiles {
  data = new Map<string, string>();
  async read(path: string): Promise<string | null> { return this.data.get(path) ?? null; }
  async write(path: string, content: Promise<never> | string): Promise<void> { this.data.set(path, String(content)); }
  async list(path: string): Promise<string[]> {
    const prefix = `${path.replace(/\/$/, '')}/`;
    return [...this.data.keys()]
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.slice(prefix.length))
      .filter((name) => !name.includes('/'))
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

test('初始 stub 识别为内置默认状态（不匹配空方案）', async () => {
  const { repo } = setup();
  const loaded = await repo.load(true);
  assert.equal(loaded.status, 'builtin');
  assert.equal(loaded.state, null);
  assert.equal(matchedProfile(loaded), undefined);
});

test('保存方案仅写 library.json，预览并启用后写 build.md、建备份并记录基线时间', async () => {
  const { files, repo } = setup();
  let loaded = await repo.load(true);
  loaded = await repo.save(loaded, { name: '合成重构方案', content: 'Synthetic system prompt body.' });
  assert.equal(files.data.get(TARGET_PATH), STUB);
  const profile = loaded.library.profiles[0]!;

  const review = await repo.reviewProfile(loaded, profile.id);
  assert.equal(review.content, '---\nmode: all\n---\n\nSynthetic system prompt body.\n');

  const applied = await repo.apply(loaded, review);
  assert.equal(applied.status, 'applied');
  assert.equal(files.data.get(TARGET_PATH), review.content);
  assert.equal(matchedProfile(applied)?.id, profile.id);
  assert.ok(applied.state);
  assert.equal(applied.state.baseline.content, STUB);
  assert.equal(applied.state.applied.content, review.content);
  assert.ok(Number.isFinite(applied.state.baselineAt));
  assert.equal((await repo.listBackups()).length, 1);
});

test('空正文方案启用时写回空 stub（等同于不覆盖），还原默认写回空 stub 并保留基线时间', async () => {
  const { files, repo } = setup();
  let loaded = await repo.load(true);
  loaded = await repo.save(loaded, { name: '非空方案', content: 'Synthetic body A.' });
  loaded = await repo.save(loaded, { name: '留空方案', content: '   ' });
  assert.equal(composePrompt(loaded.library.profiles[1]!.content), STUB);

  const firstApplied = await repo.apply(loaded, await repo.reviewProfile(loaded, loaded.library.profiles[0]!.id));
  const baselineAt = firstApplied.state?.baselineAt;
  assert.equal(firstApplied.status, 'applied');

  const emptyApplied = await repo.apply(firstApplied, await repo.reviewProfile(firstApplied, loaded.library.profiles[1]!.id));
  assert.equal(emptyApplied.status, 'builtin');
  assert.equal(files.data.get(TARGET_PATH), STUB);
  assert.equal(emptyApplied.state?.baselineAt, baselineAt);

  const reApplied = await repo.apply(emptyApplied, await repo.reviewProfile(emptyApplied, loaded.library.profiles[0]!.id));
  const restoreReview = await repo.reviewRestore(reApplied);
  assert.equal(restoreReview.content, STUB);
  const restored = await repo.apply(reApplied, restoreReview);
  assert.equal(restored.status, 'builtin');
  assert.equal(files.data.get(TARGET_PATH), STUB);
  assert.equal(restored.state?.baselineAt, baselineAt);
});

test('自动从旧版 presets.json 无损迁移至 library.json，且保留原 presets.json 文件', async () => {
  const { files, repo } = setup();
  const legacyBody = '# Synthetic Role\n\nFollow synthetic engineering steps.';
  files.data.set(TARGET_PATH, composePrompt(legacyBody));
  files.data.set(STATE_PATH, JSON.stringify({
    version: 1,
    baseline: { exists: true, content: STUB },
    applied: { exists: true, content: composePrompt(legacyBody) },
    appliedAt: 1_700_000_000_000,
    baselineLabel: '基线快照（仅记录，不用于还原）',
  }));
  const rawPresets = JSON.stringify({
    version: 1,
    presets: [{
      id: 'legacy-preset-1',
      name: '旧版合成预设',
      content: legacyBody,
      createdAt: 1_700_000_000_001,
      updatedAt: 1_700_000_000_002,
    }],
  }, null, 2);
  files.data.set(PRESETS_PATH, rawPresets);

  // 工作状态分区只读加载即可识别旧版预设匹配
  const statusLoaded = await repo.load(false);
  assert.equal(statusLoaded.status, 'applied');
  assert.equal(matchedProfile(statusLoaded)?.name, '旧版合成预设');
  assert.equal(files.data.has(LIBRARY_PATH), false);

  // 面板初始化时落盘 library.json 且不破坏 presets.json
  const panelLoaded = await repo.load(true);
  assert.equal(panelLoaded.library.profiles.length, 1);
  assert.equal(panelLoaded.library.profiles[0]?.id, 'legacy-preset-1');
  assert.equal(panelLoaded.library.profiles[0]?.name, '旧版合成预设');
  assert.ok(files.data.has(LIBRARY_PATH));
  assert.equal(files.data.get(PRESETS_PATH), rawPresets);
});

test('首次打开已有非空 build.md 且无预设库时自动导入草稿方案且不覆盖原文件', async () => {
  const { files, repo } = setup();
  files.data.set(TARGET_PATH, '---\nmode: all\n---\n\nExisting synthetic override.\n');
  const loaded = await repo.load(true);
  assert.equal(loaded.status, 'drifted');
  assert.equal(loaded.library.profiles.length, 1);
  assert.equal(loaded.library.profiles[0]?.name, '现有提示词');
  assert.equal(loaded.library.profiles[0]?.content, 'Existing synthetic override.');
  assert.equal(files.data.get(TARGET_PATH), '---\nmode: all\n---\n\nExisting synthetic override.\n');
});

test('外部修改后进入 drifted，支持只读对比、拒绝陈旧写入，且重新预览后可采纳', async () => {
  const { files, repo } = setup();
  let loaded = await repo.load(true);
  loaded = await repo.save(loaded, { name: '方案一', content: 'First synthetic body.' });
  const staleReview = await repo.reviewProfile(loaded, loaded.library.profiles[0]!.id);
  const applied = await repo.apply(loaded, staleReview);

  files.data.set(TARGET_PATH, '---\nmode: all\n---\n\nExternal synthetic edit.\n');
  const drifted = await repo.load(false);
  assert.equal(drifted.status, 'drifted');
  assert.equal(extractBody(drifted.current.content), 'External synthetic edit.');

  const inspect = repo.reviewDrift(drifted);
  assert.equal(inspect.readonly, true);
  await assert.rejects(() => repo.apply(drifted, inspect), /只读差异对比/);
  await assert.rejects(() => repo.apply(applied, staleReview), ConflictError);

  // 将外部修改保存为方案并重新预览启用后恢复为 applied
  const savedExternal = await repo.save(drifted, { name: '采纳外部方案', content: extractBody(drifted.current.content) });
  const adoptReview = await repo.reviewProfile(savedExternal, savedExternal.library.profiles[1]!.id);
  const adopted = await repo.apply(savedExternal, adoptReview);
  assert.equal(adopted.status, 'applied');
  assert.equal(matchedProfile(adopted)?.name, '采纳外部方案');
});

test('状态文件或方案库并发变化时拒绝写入', async () => {
  const { files, repo } = setup();
  let loaded = await repo.load(true);
  loaded = await repo.save(loaded, { name: '并发方案', content: 'Body.' });
  const review = await repo.reviewProfile(loaded, loaded.library.profiles[0]!.id);
  files.data.set(STATE_PATH, JSON.stringify({
    version: 1,
    baseline: { exists: true, content: STUB },
    applied: { exists: true, content: 'other' },
    appliedAt: 1,
    baselineLabel: 'x',
  }));
  await assert.rejects(() => repo.apply(loaded, review), ConflictError);
});

test('支持方案归档保护、恢复归档与导出文件', async () => {
  const { files, repo } = setup();
  let loaded = await repo.load(true);
  loaded = await repo.save(loaded, { name: '主力方案', content: 'Active synthetic prompt.' });
  loaded = await repo.save(loaded, { name: '备用方案', content: 'Standby synthetic prompt.' });
  const activeId = loaded.library.profiles[0]!.id;
  const standbyId = loaded.library.profiles[1]!.id;

  loaded = await repo.apply(loaded, await repo.reviewProfile(loaded, activeId));
  await assert.rejects(() => repo.archive(loaded, activeId, true), /当前生效的 build\.md 一致/);

  loaded = await repo.archive(loaded, standbyId, true);
  assert.equal(loaded.library.profiles[1]?.archived, true);
  await assert.rejects(() => repo.save(loaded, { id: standbyId, name: '备用方案', content: 'Edited' }), /先恢复已归档方案/);

  loaded = await repo.archive(loaded, standbyId, false);
  assert.equal(loaded.library.profiles[1]?.archived, false);

  const exported = await repo.exportProfile(loaded.library.profiles[0]!);
  assert.equal(files.data.get(exported), 'Active synthetic prompt.');
});

test('备份可以预览并恢复，无状态文件时基线仅记录不用于还原', async () => {
  const { files, repo } = setup();
  files.data.set(TARGET_PATH, 'external synthetic baseline');
  let loaded = await repo.load(true);
  loaded = await repo.save(loaded, { name: '方案 A', content: 'First body.' });
  loaded = await repo.save(loaded, { name: '方案 B', content: 'Second body.' });

  const first = await repo.apply(loaded, await repo.reviewProfile(loaded, loaded.library.profiles[1]!.id));
  assert.equal(first.state?.baseline.content, 'external synthetic baseline');

  const second = await repo.apply(first, await repo.reviewProfile(first, loaded.library.profiles[2]!.id));
  assert.equal(second.status, 'applied');

  const ids = await repo.listBackups();
  assert.equal(ids.length, 2);
  const backupReview = await repo.reviewBackup(ids[0]!);
  assert.equal(backupReview.content, '---\nmode: all\n---\n\nFirst body.\n');
  const restoredBackup = await repo.apply(second, backupReview);
  assert.equal(files.data.get(TARGET_PATH), '---\nmode: all\n---\n\nFirst body.\n');
  assert.equal(restoredBackup.status, 'applied');

  const restoredDefault = await repo.apply(restoredBackup, await repo.reviewRestore(restoredBackup));
  assert.equal(restoredDefault.status, 'builtin');
  assert.equal(files.data.get(TARGET_PATH), STUB);
  assert.equal(restoredDefault.state?.baseline.content, 'external synthetic baseline');
});

test('损坏的状态文件、方案库与旧版预设库不会静默重置', () => {
  assert.throws(() => parseState('{'), /状态文件格式有误/);
  assert.throws(() => parseState(JSON.stringify({ version: 2 })), /状态文件格式有误/);
  assert.throws(() => parseLibrary('{'), /方案库格式有误/);
  assert.throws(() => parseLibrary(JSON.stringify({ version: 2, profiles: [] })), /方案库格式有误/);
  assert.throws(() => parsePresets('{'), /预设库文件格式有误/);
  assert.throws(() => parsePresets(JSON.stringify({ version: 2, presets: [] })), /预设库文件格式有误/);
});

test('章节速跳解析忽略代码块标题，Token 估算支持中英文合成提示词', () => {
  const sample = [
    '# Role',
    '```md',
    '# Ignored inside fence',
    '```',
    '## Tooling',
    '### Verification ###',
  ].join('\n');
  const headings = extractMarkdownHeadings(sample);
  assert.deepEqual(
    headings.map((item) => ({ level: item.level, title: item.title, line: item.line })),
    [
      { level: 1, title: 'Role', line: 1 },
      { level: 2, title: 'Tooling', line: 5 },
      { level: 3, title: 'Verification', line: 6 },
    ],
  );
  assert.equal(estimateTokens(''), 0);
  assert.ok(estimateTokens('Synthetic English system prompt with rules.') > 5);
  assert.ok(estimateTokens('保持简洁严谨的中文工程规范') >= 12);
});

test('备份目录过滤非备份文件', async () => {
  const { files, repo } = setup();
  files.data.set(`${BACKUP_DIR}/not-a-backup.json`, '{}');
  files.data.set(`${BACKUP_DIR}/1700000000000-00000000-0000-4000-8000-000000000001.json`, '{}');
  assert.deepEqual(await repo.listBackups(), ['1700000000000-00000000-0000-4000-8000-000000000001']);
});
