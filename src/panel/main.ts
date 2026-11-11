import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import { createRepository } from '../core/repository.ts';
import { ConflictError, TARGET_PATH, extractBody, isStub, type Status } from '../core/types.ts';
import { explainError, hostFiles } from '../platform/host-files.ts';
import { mountView, type Action, type GuardIntent, type State } from './view.ts';
import native from '../../ui/native.css';
import { installScrollbarActivity } from '../../ui/scrollbar.ts';
import layout from './styles/layout.css';
import components from './styles/components.css';
import { applyDocumentLanguage, i18n } from './i18n.ts';

installScrollbarActivity(document);

const { t } = i18n;
const style = document.createElement('style');
style.textContent = native + layout + components;
document.head.append(style);

const host = connectHost({ requestTimeoutMs: 20_000 });
const repo = createRepository(hostFiles(host, t), Date.now, () => crypto.randomUUID(), t);
const state: State = {
  loaded: null,
  busy: false,
  review: null,
  reviewInvalid: false,
  message: '',
  tone: 'info',
  tab: 'override',
  backups: [],
  backupId: null,
  backup: null,
  presets: [],
  selectedPresetId: null,
  presetError: '',
  savingPresetMode: 'closed',
  presetNameDraft: '',
  pendingDeletePresetId: null,
  guard: null,
  custom: '',
  customDirty: false,
};

const render = () => view.render(state);
const notice = (message: string, tone: State['tone'] = 'info') => {
  state.message = message;
  state.tone = tone;
};

const syncBadge = (status: Status | undefined): void => {
  void host.setBadge(status === 'drifted' || status === 'missing' ? 1 : null).catch(() => {});
};

const clearInlineOverlays = () => {
  state.savingPresetMode = 'closed';
  state.pendingDeletePresetId = null;
  state.guard = null;
};

const run = async (work: () => Promise<void>) => {
  if (state.busy) return;
  state.busy = true;
  notice('');
  render();
  try {
    await work();
  } catch (error) {
    notice(explainError(error, t), 'error');
    if (error instanceof ConflictError && state.review) state.reviewInvalid = true;
  } finally {
    state.busy = false;
    render();
  }
};

const refresh = async () => {
  try {
    const [loaded, backups] = await Promise.all([repo.load(), repo.listBackups()]);
    state.loaded = loaded;
    state.backups = backups;
    syncBadge(loaded.status);
    try {
      state.presets = await repo.loadPresets();
      state.presetError = '';
    } catch (presetErr) {
      state.presetError = explainError(presetErr, t);
    }
    const applied = loaded.state?.applied;
    if (!state.customDirty) {
      const appliedBody = applied?.exists && !isStub(applied.content) ? extractBody(applied.content) : '';
      if (state.selectedPresetId) {
        const selected = state.presets.find((item) => item.id === state.selectedPresetId);
        if (selected) state.custom = selected.content;
        else {
          state.selectedPresetId = null;
          state.custom = appliedBody;
        }
      } else {
        state.custom = appliedBody;
        if (appliedBody) {
          const matched = state.presets.find((item) => item.content.trim() === appliedBody);
          if (matched) state.selectedPresetId = matched.id;
        }
      }
    }
    state.review = null;
    state.reviewInvalid = false;
  } catch (error) {
    if (state.loaded) throw new Error(`${explainError(error, t)} ${t('当前仍显示上次读取结果')}。`, { cause: error });
    throw error;
  }
};

const applyGuardIntent = (intent: GuardIntent): void => {
  clearInlineOverlays();
  if (intent.kind === 'selectPreset') {
    if (!intent.id) {
      state.selectedPresetId = null;
      state.customDirty = false;
    } else {
      const target = state.presets.find((item) => item.id === intent.id);
      if (target) {
        state.selectedPresetId = target.id;
        state.custom = target.content;
        state.customDirty = false;
      }
    }
  } else if (intent.kind === 'newDraft') {
    state.selectedPresetId = null;
    state.custom = '';
    state.customDirty = false;
  } else if (intent.kind === 'loadDisk') {
    const raw = state.loaded?.current.content ?? '';
    state.selectedPresetId = null;
    state.custom = isStub(raw) ? '' : extractBody(raw);
    state.customDirty = true;
    notice(t('已将磁盘当前 build.md 正文载入编辑器草稿。'), 'info');
  }
  render();
};

const requestWithGuard = (intent: GuardIntent): void => {
  if (state.customDirty) {
    state.savingPresetMode = 'closed';
    state.pendingDeletePresetId = null;
    state.guard = intent;
    render();
    return;
  }
  applyGuardIntent(intent);
};

const openSaveBar = (mode: 'save' | 'saveAs'): void => {
  if (!state.custom.trim() || state.presetError) return;
  state.pendingDeletePresetId = null;
  state.guard = null;
  const active = mode === 'save' ? state.presets.find((item) => item.id === state.selectedPresetId) ?? null : null;
  if (active && mode === 'save') {
    void run(async () => {
      const { presets, saved } = await repo.savePreset({
        id: active.id,
        name: active.name,
        content: state.custom,
      });
      state.presets = presets;
      state.selectedPresetId = saved.id;
      state.custom = saved.content;
      state.customDirty = false;
      clearInlineOverlays();
      notice(t('预设“{name}”已保存（未写入 build.md，点击下方“应用覆盖”可启用）。', { name: saved.name }), 'success');
    });
    return;
  }
  state.savingPresetMode = mode;
  state.presetNameDraft = active ? `${active.name} 副本` : '';
  render();
};

const actions: Record<Action, () => void> = {
  refresh: () => { void run(refresh); },
  applyBundled: () => {
    void run(async () => {
      if (!state.loaded) return;
      clearInlineOverlays();
      state.review = await repo.reviewApply(state.loaded, state.custom);
      state.reviewInvalid = false;
    });
  },
  restore: () => {
    void run(async () => {
      if (!state.loaded) return;
      clearInlineOverlays();
      state.review = await repo.reviewRestore(state.loaded);
      state.reviewInvalid = false;
    });
  },
  confirm: () => {
    void run(async () => {
      if (!state.loaded || !state.review) return;
      const reviewKind = state.review.kind;
      try {
        state.loaded = await repo.apply(state.loaded, state.review);
        state.review = null;
        state.customDirty = false;
        state.backups = await repo.listBackups();
        syncBadge(state.loaded.status);
        notice(
          state.loaded.status === 'builtin'
            ? t('已还原为空 stub，交回 OpenCode 默认。建议新建会话确认。')
            : reviewKind === 'apply'
              ? t('覆盖已写入 build.md。建议新建会话确认加载。')
              : t('还原已写入。建议新建会话确认。'),
          'success',
        );
      } catch (error) {
        state.reviewInvalid = true;
        try {
          state.loaded = await repo.load();
          syncBadge(state.loaded.status);
        } catch {
          /* Keep last observed state. */
        }
        throw error;
      }
    });
  },
  cancel: () => {
    state.review = null;
    state.reviewInvalid = false;
    notice('');
    render();
  },
  backupRestore: () => {
    void run(async () => {
      if (!state.backupId) return;
      state.review = await repo.reviewBackup(state.backupId);
      state.reviewInvalid = false;
    });
  },
  newDraft: () => {
    requestWithGuard({ kind: 'newDraft' });
  },
  openSavePreset: () => {
    openSaveBar('save');
  },
  openSaveAsPreset: () => {
    openSaveBar('saveAs');
  },
  confirmSavePreset: () => {
    void run(async () => {
      const id = state.savingPresetMode === 'save' ? state.selectedPresetId : null;
      const { presets, saved } = await repo.savePreset({
        id,
        name: state.presetNameDraft,
        content: state.custom,
      });
      state.presets = presets;
      state.selectedPresetId = saved.id;
      state.custom = saved.content;
      state.customDirty = false;
      clearInlineOverlays();
      notice(t('预设“{name}”已保存（未写入 build.md，点击下方“应用覆盖”可启用）。', { name: saved.name }), 'success');
    });
  },
  cancelSavePreset: () => {
    state.savingPresetMode = 'closed';
    render();
  },
  askDeletePreset: () => {
    if (!state.selectedPresetId) return;
    state.savingPresetMode = 'closed';
    state.guard = null;
    state.pendingDeletePresetId = state.selectedPresetId;
    render();
  },
  confirmDeletePreset: () => {
    void run(async () => {
      const id = state.pendingDeletePresetId;
      if (!id) return;
      const target = state.presets.find((item) => item.id === id);
      state.presets = await repo.deletePreset(id);
      if (state.selectedPresetId === id) state.selectedPresetId = null;
      clearInlineOverlays();
      if (target) notice(t('已删除预设“{name}”。', { name: target.name }), 'info');
    });
  },
  cancelDeletePreset: () => {
    state.pendingDeletePresetId = null;
    render();
  },
  copyText: () => {
    if (!state.custom.trim()) return;
    void host.writeClipboard(state.custom)
      .then(() => { notice(t('已复制提示词正文。'), 'success'); render(); })
      .catch(() => { notice(t('复制失败，请检查剪贴板权限。'), 'error'); render(); });
  },
  copyTargetPath: () => {
    void host.writeClipboard(TARGET_PATH)
      .then(() => { notice(t('已复制目标文件路径。'), 'success'); render(); })
      .catch(() => { notice(t('复制失败，请检查剪贴板权限。'), 'error'); render(); });
  },
  inspectDrift: () => {
    if (!state.loaded) return;
    clearInlineOverlays();
    state.review = repo.reviewDrift(state.loaded);
    state.reviewInvalid = false;
    render();
  },
  loadDiskBody: () => {
    if (!state.loaded?.current.exists) return;
    requestWithGuard({ kind: 'loadDisk' });
  },
  confirmGuard: () => {
    if (!state.guard) return;
    applyGuardIntent(state.guard);
  },
  cancelGuard: () => {
    state.guard = null;
    render();
  },
};

const view = mountView(document.querySelector<HTMLElement>('#root')!, i18n, {
  action: (action) => { if (!state.busy) actions[action](); },
  tab: (id) => {
    if (state.busy || state.review) return;
    state.tab = id === 'backups' ? 'backups' : 'override';
    render();
    if (state.tab === 'backups') void run(async () => { state.backups = await repo.listBackups(); });
  },
  backup: (id) => {
    state.backupId = id;
    state.backup = null;
    render();
    void run(async () => { state.backup = await repo.readBackup(id); });
  },
  preset: (id) => {
    const nextId = id === '__draft__' ? null : id;
    if (nextId === state.selectedPresetId && !state.customDirty) return;
    requestWithGuard({ kind: 'selectPreset', id: nextId });
  },
  presetName: (value) => {
    state.presetNameDraft = value;
    render();
  },
  custom: (value) => {
    state.custom = value;
    const active = state.presets.find((item) => item.id === state.selectedPresetId);
    state.customDirty = active ? value !== active.content : value.trim().length > 0;
    render();
  },
});

document.addEventListener('keydown', (event) => {
  if (state.busy) return;
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    if (state.tab === 'override' && !state.review && state.custom.trim() && !state.presetError) {
      event.preventDefault();
      openSaveBar('save');
    }
    return;
  }
  if (event.key === 'Escape') {
    if (state.review) {
      event.preventDefault();
      actions.cancel();
    } else if (state.savingPresetMode !== 'closed' || state.pendingDeletePresetId || state.guard) {
      event.preventDefault();
      clearInlineOverlays();
      render();
    }
  }
});

let initialized = false;
host.onReady((context) => {
  applyHostReady(context, document.documentElement);
  const changed = i18n.setLocale(context.locale);
  applyDocumentLanguage(i18n);
  document.title = t('内置提示词');
  if (!initialized) {
    initialized = true;
    if (changed) view.localize();
    void run(refresh);
    return;
  }
  if (changed) {
    view.localize();
    render();
  }
});
document.title = t('内置提示词');
render();
