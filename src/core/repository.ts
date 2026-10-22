import {
  BACKUP_DIR,
  BASELINE_LABEL,
  ConflictError,
  MAX_PROMPT,
  STATE_PATH,
  STUB,
  TARGET_PATH,
  composePrompt,
  isStub,
  sameSnapshot,
  type Backup,
  type Files,
  type Loaded,
  type Review,
  type Snapshot,
  type State,
  type Status,
} from './types.ts';

const validSnapshot = (value: unknown): value is Snapshot => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Snapshot;
  return typeof item.exists === 'boolean' && typeof item.content === 'string';
};

const validBackupId = (value: string): boolean => /^\d{13}-[a-f0-9-]{36}$/.test(value);

export const validatePrompt = (body: string): void => {
  if (!body.trim()) throw new Error('覆盖文本不能为空。');
  if (body.length > MAX_PROMPT) throw new Error(`覆盖文本不能超过 ${MAX_PROMPT.toLocaleString('zh-CN')} 个字符。`);
  if (body.includes('\0')) throw new Error('覆盖文本不能包含空字节。');
};

export const parseState = (raw: string): State => {
  try {
    const data = JSON.parse(raw) as State;
    if (data.version !== 1 || !validSnapshot(data.baseline) || !validSnapshot(data.applied)) throw new Error();
    if (!Number.isFinite(data.appliedAt) || typeof data.baselineLabel !== 'string') throw new Error();
    return data;
  } catch {
    throw new Error('覆盖状态文件格式有误，现有 build.md 未修改。请修复 state.json 或从备份恢复。');
  }
};

const detectStatus = (state: State | null, current: Snapshot): Status => {
  if (!current.exists) return 'missing';
  if (state) {
    if (sameSnapshot(current, state.baseline)) return isStub(state.baseline.content) ? 'builtin' : 'baseline';
    if (sameSnapshot(current, state.applied)) return 'applied';
    return 'drifted';
  }
  return isStub(current.content) ? 'builtin' : 'drifted';
};

const baselineFor = (loaded: Loaded, review: Review, current: Snapshot): Snapshot => {
  if (loaded.state) return loaded.state.baseline;
  if (review.kind === 'restore') return { exists: true, content: isStub(review.content) ? STUB : review.content };
  if (review.kind === 'backup') return { exists: true, content: isStub(review.content) ? review.content : STUB };
  return current;
};

export const createRepository = (
  files: Files,
  now: () => number = Date.now,
  uuid: () => string = () => crypto.randomUUID(),
) => {
  const readCurrent = async (): Promise<Snapshot> => {
    const content = await files.read(TARGET_PATH);
    return { exists: content !== null, content: content ?? '' };
  };

  const readStateRaw = async (): Promise<string | null> => files.read(STATE_PATH);

  const load = async (): Promise<Loaded> => {
    const [current, stateRaw] = await Promise.all([readCurrent(), readStateRaw()]);
    const state = stateRaw === null ? null : parseState(stateRaw);
    return { state, stateRaw, current, status: detectStatus(state, current) };
  };

  const backup = async (label: string, content: string): Promise<string> => {
    const stamp = now();
    const id = `${stamp}-${uuid()}`;
    const item: Backup = { version: 1, id, createdAt: stamp, label, content };
    const path = `${BACKUP_DIR}/${id}.json`;
    const raw = JSON.stringify(item, null, 2);
    await files.write(path, raw);
    if (await files.read(path) !== raw) throw new Error('备份校验失败，目标文件未修改。');
    return id;
  };

  const reviewApply = async (loaded: Loaded, body: string): Promise<Review> => {
    validatePrompt(body);
    return { kind: 'apply', before: loaded.current, content: composePrompt(body), label: '应用覆盖' };
  };

  const reviewRestore = async (loaded: Loaded): Promise<Review> => {
    const content = loaded.state?.baseline.exists ? loaded.state.baseline.content : STUB;
    return { kind: 'restore', before: loaded.current, content, label: '还原内置' };
  };

  const listBackups = async (): Promise<string[]> => (await files.list(BACKUP_DIR))
    .filter(name => /^\d{13}-[a-f0-9-]{36}\.json$/.test(name))
    .sort()
    .reverse()
    .slice(0, 50)
    .map(name => name.slice(0, -5));

  const readBackup = async (id: string): Promise<Backup> => {
    if (!validBackupId(id)) throw new Error('备份编号无效。');
    const raw = await files.read(`${BACKUP_DIR}/${id}.json`);
    try {
      const data = JSON.parse(raw ?? '') as Backup;
      if (data.version !== 1 || data.id !== id || !Number.isFinite(data.createdAt) || typeof data.label !== 'string' || typeof data.content !== 'string') throw new Error();
      return data;
    } catch {
      throw new Error('备份缺失或格式有误，未修改 build.md。');
    }
  };

  const reviewBackup = async (id: string): Promise<Review> => {
    const item = await readBackup(id);
    return {
      kind: 'backup',
      before: await readCurrent(),
      content: item.content,
      label: `恢复备份 ${new Date(item.createdAt).toLocaleString('zh-CN')}`,
      backupId: id,
    };
  };

  const apply = async (loaded: Loaded, review: Review): Promise<Loaded> => {
    const [current, stateRaw] = await Promise.all([readCurrent(), readStateRaw()]);
    if (stateRaw !== loaded.stateRaw) throw new ConflictError('覆盖状态已被其他窗口修改。请重新读取后再操作。');
    if (!sameSnapshot(current, review.before)) throw new ConflictError('build.md 在预览后已被修改，未写入。请重新读取并预览差异。');
    if (current.exists && current.content === review.content) return load();

    if (current.exists) await backup(`${review.label}前`, current.content);

    await files.write(TARGET_PATH, review.content);
    const result = await readCurrent();
    if (!result.exists || result.content !== review.content) {
      throw new ConflictError('写入后文件内容与预览不一致，可能有其他编辑器同时写入。请重新读取；操作前的备份仍可查看。');
    }

    const next: State = {
      version: 1,
      baseline: baselineFor(loaded, review, current),
      applied: { exists: true, content: review.content },
      appliedAt: now(),
      baselineLabel: loaded.state?.baselineLabel ?? BASELINE_LABEL,
    };
    const raw = JSON.stringify(next, null, 2);
    await files.write(STATE_PATH, raw);
    if (await files.read(STATE_PATH) !== raw) {
      throw new Error('build.md 已写入，但覆盖状态回读不一致。请重新读取确认，不要重复应用。');
    }
    return load();
  };

  return { load, reviewApply, reviewRestore, reviewBackup, apply, listBackups, readBackup };
};

export type Repository = ReturnType<typeof createRepository>;
