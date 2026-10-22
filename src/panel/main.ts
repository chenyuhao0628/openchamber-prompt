import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import { createRepository } from '../core/repository.ts';
import { ConflictError, isStub } from '../core/types.ts';
import { explainError, hostFiles } from '../platform/host-files.ts';
import { mountView, type Action, type State } from './view.ts';
import native from '../../ui/native.css';
import layout from './styles/layout.css';
import components from './styles/components.css';

const style = document.createElement('style');
style.textContent = native + layout + components;
document.head.append(style);

const host = connectHost({ requestTimeoutMs: 20_000 });
const repo = createRepository(hostFiles(host));
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
  custom: '',
  customDirty: false,
};

const bodyOf = (content: string): string => {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return (match ? content.slice(match[0].length) : content).trim();
};

const render = () => view.render(state);
const notice = (message: string, tone: State['tone'] = 'info') => { state.message = message; state.tone = tone; };
const run = async (work: () => Promise<void>) => {
  if (state.busy) return;
  state.busy = true;
  notice('');
  render();
  try {
    await work();
  } catch (error) {
    notice(explainError(error), 'error');
    if (error instanceof ConflictError && state.review) state.reviewInvalid = true;
  } finally {
    state.busy = false;
    render();
  }
};

const refresh = async () => {
  try {
    const loaded = await repo.load();
    state.loaded = loaded;
    state.backups = await repo.listBackups();
    const applied = loaded.state?.applied;
    if (!state.customDirty) state.custom = applied?.exists && !isStub(applied.content) ? bodyOf(applied.content) : '';
    state.review = null;
    state.reviewInvalid = false;
  } catch (error) {
    if (state.loaded) throw new Error(`${explainError(error)} 当前仍显示上次读取结果。`, { cause: error });
    throw error;
  }
};

const actions: Record<Action, () => void> = {
  refresh: () => { void run(refresh); },
  applyBundled: () => { void run(async () => {
    if (!state.loaded) return;
    state.review = await repo.reviewApply(state.loaded, state.custom);
    state.reviewInvalid = false;
  }); },
  restore: () => { void run(async () => {
    if (!state.loaded) return;
    state.review = await repo.reviewRestore(state.loaded);
    state.reviewInvalid = false;
  }); },
  confirm: () => { void run(async () => {
    if (!state.loaded || !state.review) return;
    try {
      state.loaded = await repo.apply(state.loaded, state.review);
      state.review = null;
      state.customDirty = false;
      state.backups = await repo.listBackups();
      notice(state.loaded.status === 'builtin' ? '已还原为内置提示词。建议新建会话确认。' : '覆盖已写入 build.md。建议新建会话确认加载。', 'success');
    } catch (error) {
      state.reviewInvalid = true;
      try { state.loaded = await repo.load(); } catch { /* Keep last observed state. */ }
      throw error;
    }
  }); },
  cancel: () => { state.review = null; state.reviewInvalid = false; notice(''); render(); },
  backupRestore: () => { void run(async () => {
    if (!state.backupId) return;
    state.review = await repo.reviewBackup(state.backupId);
    state.reviewInvalid = false;
  }); },
};

const view = mountView(document.querySelector<HTMLElement>('#root')!, {
  action: action => { if (!state.busy) actions[action](); },
  tab: id => {
    if (state.busy || state.review) return;
    state.tab = id === 'backups' ? 'backups' : 'override';
    render();
    if (state.tab === 'backups') void run(async () => { state.backups = await repo.listBackups(); });
  },
  backup: id => {
    state.backupId = id;
    state.backup = null;
    render();
    void run(async () => { state.backup = await repo.readBackup(id); });
  },
  custom: value => { state.custom = value; state.customDirty = true; render(); },
});

let initialized = false;
host.onReady(context => {
  applyHostReady(context, document.documentElement);
  if (!initialized) { initialized = true; void run(refresh); }
});
render();
