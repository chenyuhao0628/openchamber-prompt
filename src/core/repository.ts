import { sourceTranslate, type Translate } from '../shared/i18n.ts';
import {
  BACKUP_DIR,
  BASELINE_LABEL,
  ConflictError,
  DATA_DIR,
  LIBRARY_PATH,
  MAX_PRESETS,
  MAX_PRESET_NAME,
  MAX_PROFILES,
  MAX_PROMPT,
  PRESETS_PATH,
  STATE_PATH,
  STUB,
  TARGET_PATH,
  composePrompt,
  extractBody,
  isStub,
  sameSnapshot,
  type Backup,
  type Files,
  type Library,
  type Loaded,
  type PresetLibrary,
  type Profile,
  type PromptPreset,
  type Review,
  type Snapshot,
  type State,
  type Status,
} from './types.ts';

const identity: Translate = sourceTranslate;
const validId = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(value);
const validBackupId = (value: string): boolean => /^\d{13}-[a-f0-9-]{36}$/.test(value);

const validSnapshot = (value: unknown): value is Snapshot => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Snapshot;
  return typeof item.exists === 'boolean' && typeof item.content === 'string';
};

const validPreset = (value: unknown): value is PromptPreset => {
  if (!value || typeof value !== 'object') return false;
  const item = value as PromptPreset;
  return (
    typeof item.id === 'string' && item.id.length > 0 && item.id.length <= 120
    && typeof item.name === 'string' && item.name.trim().length > 0 && item.name.length <= MAX_PRESET_NAME
    && typeof item.content === 'string' && item.content.length <= MAX_PROMPT
    && Number.isFinite(item.createdAt)
    && Number.isFinite(item.updatedAt)
  );
};

export const validateDraft = (name: string, content: string, t: Translate = identity): void => {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > MAX_PRESET_NAME || /[\0\r\n]/.test(trimmed)) {
    throw new Error(t('方案名称需要 1–60 个字符。'));
  }
  if (content.length > MAX_PROMPT) {
    throw new Error(t('提示词内容不能超过 100,000 个字符。'));
  }
  if (content.includes('\0')) {
    throw new Error(t('请选择纯文本提示词，内容不能包含空字节。'));
  }
};

export const parseState = (raw: string, t: Translate = identity): State => {
  try {
    const data = JSON.parse(raw) as State;
    if (data.version !== 1 || !validSnapshot(data.baseline) || !validSnapshot(data.applied)) throw new Error();
    if (!Number.isFinite(data.appliedAt) || typeof data.baselineLabel !== 'string') throw new Error();
    if (data.baselineAt !== undefined && !Number.isFinite(data.baselineAt)) throw new Error();
    return data;
  } catch {
    throw new Error(t('覆盖状态文件格式有误，现有 build.md 未修改。请修复 state.json 或从备份恢复。'));
  }
};

export const parsePresets = (raw: string, t: Translate = identity): PresetLibrary => {
  try {
    const data = JSON.parse(raw) as PresetLibrary;
    if (!data || typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.presets)) throw new Error();
    if (data.presets.length > MAX_PRESETS || !data.presets.every(validPreset)) throw new Error();
    return {
      version: 1,
      presets: data.presets.map((preset) => ({ ...preset })),
    };
  } catch {
    throw new Error(t('预设库文件格式有误，现有 presets.json 未修改。请修复后再读取。'));
  }
};

export const parseLibrary = (raw: string, t: Translate = identity): Library => {
  try {
    const data = JSON.parse(raw) as Library;
    if (!data || typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.profiles) || data.profiles.length > MAX_PROFILES) {
      throw new Error();
    }
    const ids = new Set<string>();
    for (const profile of data.profiles) {
      if (
        !profile
        || !validId(profile.id)
        || ids.has(profile.id)
        || typeof profile.name !== 'string'
        || typeof profile.content !== 'string'
        || typeof profile.archived !== 'boolean'
        || !Number.isFinite(profile.createdAt)
        || !Number.isFinite(profile.updatedAt)
      ) {
        throw new Error();
      }
      validateDraft(profile.name, profile.content, t);
      ids.add(profile.id);
    }
    return data;
  } catch {
    throw new Error(t('方案库格式有误，现有文件未修改。请先修复 library.json 或恢复其备份。'));
  }
};

const detectStatus = (state: State | null, current: Snapshot): Status => {
  if (!current.exists) return 'missing';
  if (isStub(current.content)) return 'builtin';
  if (state) {
    if (sameSnapshot(current, state.applied)) return 'applied';
    if (sameSnapshot(current, state.baseline)) return 'baseline';
    return 'drifted';
  }
  return 'drifted';
};

const baselineFor = (loaded: Loaded, review: Review, current: Snapshot): Snapshot => {
  if (loaded.state) return loaded.state.baseline;
  if (review.source === 'restore') return { exists: true, content: isStub(review.content) ? STUB : review.content };
  if (review.source === 'backup') return { exists: true, content: isStub(review.content) ? review.content : STUB };
  return current;
};

const sameLibraryRaw = async (files: Files, expected: string | null, t: Translate): Promise<void> => {
  if (await files.read(LIBRARY_PATH) !== expected) {
    throw new ConflictError(t('方案库已被其他窗口修改。请先重新读取，当前草稿会保留。'));
  }
};

export const createRepository = (
  files: Files,
  now: () => number = Date.now,
  uuid: () => string = () => crypto.randomUUID(),
  t: Translate = identity,
) => {
  const readCurrent = async (): Promise<Snapshot> => {
    const content = await files.read(TARGET_PATH);
    return { exists: content !== null, content: content ?? '' };
  };

  const readStateRaw = async (): Promise<string | null> => files.read(STATE_PATH);

  const writeLibrary = async (library: Library, expected: string | null): Promise<string> => {
    const raw = JSON.stringify(library, null, 2);
    if (raw.length > 1_500_000) throw new Error(t('方案库已达到容量上限，请先导出并整理内容。'));
    await sameLibraryRaw(files, expected, t);
    await files.write(LIBRARY_PATH, raw);
    if (await files.read(LIBRARY_PATH) !== raw) {
      throw new ConflictError(t('保存后方案库又发生了变化，请重新读取；不要重复覆盖。'));
    }
    return raw;
  };

  const migrateLegacyPresets = (raw: string): Profile[] => {
    const legacy = parsePresets(raw, t);
    const ids = new Set<string>();
    const names = new Set<string>();
    const profiles: Profile[] = [];
    for (const preset of legacy.presets) {
      const id = validId(preset.id) && !ids.has(preset.id) ? preset.id : uuid();
      let name = preset.name.trim().slice(0, MAX_PRESET_NAME);
      if (names.has(name)) {
        name = `${name.slice(0, MAX_PRESET_NAME - 4)} (${profiles.length + 1})`;
      }
      ids.add(id);
      names.add(name);
      profiles.push({
        id,
        name,
        content: extractBody(preset.content),
        archived: false,
        createdAt: preset.createdAt,
        updatedAt: preset.updatedAt,
      });
    }
    return profiles;
  };

  const load = async (initialize = false): Promise<Loaded> => {
    const [current, stateRaw, libraryRaw] = await Promise.all([
      readCurrent(),
      readStateRaw(),
      files.read(LIBRARY_PATH),
    ]);
    const state = stateRaw === null ? null : parseState(stateRaw, t);
    const status = detectStatus(state, current);

    if (libraryRaw !== null) {
      return { state, stateRaw, current, status, library: parseLibrary(libraryRaw, t), libraryRaw };
    }

    const presetsRaw = await files.read(PRESETS_PATH);
    const library: Library = { version: 1, profiles: [] };
    if (presetsRaw !== null) {
      library.profiles = migrateLegacyPresets(presetsRaw);
    } else if (initialize && current.exists && !isStub(current.content)) {
      const body = extractBody(current.content);
      validateDraft(t('现有提示词'), body, t);
      const stamp = now();
      library.profiles.push({
        id: uuid(),
        name: t('现有提示词'),
        content: body,
        archived: false,
        createdAt: stamp,
        updatedAt: stamp,
      });
    }

    const writtenRaw = initialize ? await writeLibrary(library, null) : null;
    return { state, stateRaw, current, status, library, libraryRaw: writtenRaw };
  };

  const save = async (loaded: Loaded, draft: { id?: string; name: string; content: string }): Promise<Loaded> => {
    validateDraft(draft.name, draft.content, t);
    const trimmedName = draft.name.trim();
    const normalizedBody = extractBody(draft.content);
    const library = structuredClone(loaded.library);
    const existing = draft.id ? library.profiles.find((profile) => profile.id === draft.id) : undefined;
    if (draft.id && !existing) throw new ConflictError(t('此方案已不在方案库中，请重新读取。'));
    if (existing?.archived) throw new Error(t('请先恢复已归档方案，再编辑。'));
    if (library.profiles.some((profile) => profile.id !== draft.id && profile.name === trimmedName)) {
      throw new Error(t('已有同名方案，请使用不同名称。'));
    }
    const stamp = now();
    if (existing) {
      Object.assign(existing, { name: trimmedName, content: normalizedBody, updatedAt: stamp });
    } else {
      if (library.profiles.length >= MAX_PROFILES) {
        throw new Error(t('最多保存 100 个方案（含归档方案）。'));
      }
      library.profiles.push({
        id: uuid(),
        name: trimmedName,
        content: normalizedBody,
        archived: false,
        createdAt: stamp,
        updatedAt: stamp,
      });
    }
    const libraryRaw = await writeLibrary(library, loaded.libraryRaw);
    return { ...loaded, library, libraryRaw };
  };

  const archive = async (loaded: Loaded, id: string, archived: boolean): Promise<Loaded> => {
    const library = structuredClone(loaded.library);
    const profile = library.profiles.find((item) => item.id === id);
    if (!profile) throw new ConflictError(t('此方案不存在，请重新读取。'));
    const [current, stateRaw] = await Promise.all([readCurrent(), readStateRaw()]);
    if (archived && current.exists && !isStub(current.content) && composePrompt(profile.content) === current.content) {
      throw new Error(t('该方案与当前生效的 build.md 一致，请先启用其他方案或还原默认后再归档。'));
    }
    profile.archived = archived;
    profile.updatedAt = now();
    const libraryRaw = await writeLibrary(library, loaded.libraryRaw);
    const state = stateRaw === null ? null : parseState(stateRaw, t);
    return { state, stateRaw, current, status: detectStatus(state, current), library, libraryRaw };
  };

  const backup = async (label: string, content: string): Promise<string> => {
    const stamp = now();
    const id = `${stamp}-${uuid()}`;
    const item: Backup = { version: 1, id, createdAt: stamp, label, content };
    const path = `${BACKUP_DIR}/${id}.json`;
    const raw = JSON.stringify(item, null, 2);
    await files.write(path, raw);
    if (await files.read(path) !== raw) throw new Error(t('备份校验失败，目标文件未修改。'));
    return id;
  };

  const reviewProfile = async (loaded: Loaded, id: string): Promise<Review> => {
    await sameLibraryRaw(files, loaded.libraryRaw, t);
    const profile = loaded.library.profiles.find((item) => item.id === id && !item.archived);
    if (!profile) throw new Error(t('请选择一个未归档的已保存方案。'));
    return {
      source: 'profile',
      name: profile.name,
      content: composePrompt(profile.content),
      before: await readCurrent(),
      profileId: profile.id,
    };
  };

  const reviewRestore = async (_loaded?: Loaded): Promise<Review> => ({
    source: 'restore',
    name: t('还原默认'),
    before: await readCurrent(),
    content: STUB,
  });

  const reviewDrift = (loaded: Loaded): Review => {
    const expected = loaded.state?.applied ?? { exists: true, content: STUB };
    return {
      source: 'drift',
      name: t('外部修改差异对比'),
      before: expected,
      content: loaded.current.content,
      readonly: true,
    };
  };

  const listBackups = async (): Promise<string[]> => (await files.list(BACKUP_DIR))
    .filter((name) => /^\d{13}-[a-f0-9-]{36}\.json$/.test(name))
    .sort()
    .reverse()
    .slice(0, 50)
    .map((name) => name.slice(0, -5));

  const readBackup = async (id: string): Promise<Backup> => {
    if (!validBackupId(id)) throw new Error(t('备份编号无效。'));
    const raw = await files.read(`${BACKUP_DIR}/${id}.json`);
    try {
      const data = JSON.parse(raw ?? '') as Backup;
      if (data.version !== 1 || data.id !== id || !Number.isFinite(data.createdAt) || typeof data.label !== 'string' || typeof data.content !== 'string') {
        throw new Error();
      }
      return data;
    } catch {
      throw new Error(t('备份缺失或格式有误，未修改 build.md。'));
    }
  };

  const reviewBackup = async (id: string): Promise<Review> => {
    const item = await readBackup(id);
    return {
      source: 'backup',
      name: new Date(item.createdAt).toLocaleString(),
      before: await readCurrent(),
      content: item.content,
      backupId: id,
    };
  };

  const apply = async (loaded: Loaded, review: Review): Promise<Loaded> => {
    if (review.readonly) {
      throw new Error(t('只读差异对比不能直接写入，请先保存方案再预览启用。'));
    }
    if (review.source === 'profile') {
      await sameLibraryRaw(files, loaded.libraryRaw, t);
      const profile = loaded.library.profiles.find((item) => item.id === review.profileId && !item.archived);
      if (!profile || composePrompt(profile.content) !== review.content) {
        throw new ConflictError(t('方案已变化，请重新预览。'));
      }
    }

    let [current, stateRaw] = await Promise.all([readCurrent(), readStateRaw()]);
    if (stateRaw !== loaded.stateRaw) {
      throw new ConflictError(t('覆盖状态已被其他窗口修改。请重新读取后再操作。'));
    }
    if (!sameSnapshot(current, review.before)) {
      throw new ConflictError(t('build.md 在预览后已被修改，未写入。请返回并重新预览差异。'));
    }
    if (current.exists && current.content === review.content && loaded.status !== 'drifted' && loaded.status !== 'baseline') {
      return load(false);
    }

    if (current.exists && current.content !== review.content) {
      const actionLabel = review.source === 'backup'
        ? t('恢复备份“{name}”', { name: review.name })
        : review.source === 'restore'
          ? t('还原默认')
          : t('启用“{name}”', { name: review.name });
      await backup(t('{label}前', { label: actionLabel }), current.content);
    }

    if (review.source === 'profile') await sameLibraryRaw(files, loaded.libraryRaw, t);
    [current, stateRaw] = await Promise.all([readCurrent(), readStateRaw()]);
    if (stateRaw !== loaded.stateRaw) {
      throw new ConflictError(t('覆盖状态已被其他窗口修改。请重新读取后再操作。'));
    }
    if (!sameSnapshot(current, review.before)) {
      throw new ConflictError(t('写入前 build.md 发生变化，未写入。请重新预览。'));
    }

    await files.write(TARGET_PATH, review.content);
    const result = await readCurrent();
    if (!result.exists || result.content !== review.content) {
      throw new ConflictError(t('写入后文件内容与预览不一致，可能有其他编辑器同时写入。请重新读取；操作前的备份仍可查看。'));
    }

    const stamp = now();
    const next: State = {
      version: 1,
      baseline: baselineFor(loaded, review, current),
      applied: { exists: true, content: review.content },
      appliedAt: stamp,
      baselineAt: loaded.state?.baselineAt ?? loaded.state?.appliedAt ?? stamp,
      baselineLabel: loaded.state?.baselineLabel ?? BASELINE_LABEL,
    };
    const raw = JSON.stringify(next, null, 2);
    await files.write(STATE_PATH, raw);
    if (await files.read(STATE_PATH) !== raw) {
      throw new Error(t('build.md 已写入，但覆盖状态回读不一致。请重新读取确认，不要重复应用。'));
    }
    return load(false);
  };

  const exportProfile = async (profile: Profile): Promise<string> => {
    if (!validId(profile.id)) throw new Error(t('方案编号无效。'));
    const path = `${DATA_DIR}/exports/${profile.id}.md`;
    await files.write(path, profile.content);
    return path;
  };

  return {
    load,
    readCurrent,
    save,
    archive,
    reviewProfile,
    reviewRestore,
    reviewDrift,
    reviewBackup,
    apply,
    listBackups,
    readBackup,
    exportProfile,
  };
};

export type Repository = ReturnType<typeof createRepository>;
