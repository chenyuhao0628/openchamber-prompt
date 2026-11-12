import { connectHost, type GuestStatusControl } from '@openchamber/sdk';
import { applyHostReady, mountButton } from '@openchamber/sdk/ui';
import { createRepository } from '../core/repository.ts';
import { TARGET_PATH, estimateTokens, extractBody, isStub, matchedProfile } from '../core/types.ts';
import { explainError, hostFiles } from '../platform/host-files.ts';
import { currentLabel, el } from './view.ts';
import native from '../../ui/native.css';
import { openManager } from '../../ui/navigation.ts';
import { installScrollbarActivity } from '../../ui/scrollbar.ts';
import layout from './styles/layout.css';
import components from './styles/components.css';
import { applyDocumentLanguage, i18n } from './i18n.ts';

const { t } = i18n;
const style = document.createElement('style');
style.textContent = native + layout + components;
document.head.append(style);
installScrollbarActivity(document);

const host = connectHost();
const repo = createRepository(hostFiles(host, t), Date.now, () => crypto.randomUUID(), t);
const app = el('section', 'ext po-section');
const dot = el('span', 'po-status-dot');
const title = el('p', 'po-status-value', t('正在读取…'));
title.setAttribute('role', 'status');
const rowLabel = el('span', 'po-status-label', t('当前方案'));
const valueWrap = el('span', 'po-status-value-wrap');
valueWrap.append(dot, title);
const row = el('div', 'po-status-row');
row.append(rowLabel, valueWrap);

const note = el('p', 'ext-muted', TARGET_PATH);
const message = el('p', 'ext-notice');
note.title = t('仅表示当前连接服务器的文件状态，不代表已有会话已重新加载提示词。');
message.hidden = true;
message.setAttribute('role', 'status');
const footer = el('div', 'po-status-footer');
const actions = el('div', 'ext-actions');
footer.append(note, actions);
app.append(row, footer, message);
document.querySelector('#root')!.append(app);

let busy = false;
let initialized = false;
let statusControlsSupported = false;
let statusControlSignature = '';

const triggerManage = () => {
  message.hidden = true;
  void openManager(host, { id: 'prompt-override', name: t('内置提示词') }).catch((error) => {
    message.hidden = false;
    message.dataset.tone = 'error';
    message.textContent = error instanceof Error ? error.message : explainError(error, t);
  });
};

const syncStatusControls = () => {
  actions.hidden = statusControlsSupported;
  if (!statusControlsSupported) return;
  const controls: GuestStatusControl[] = [
    { kind: 'button', id: 'refresh', label: t('刷新'), disabled: busy || !initialized },
    { kind: 'button', id: 'manage', label: t('管理'), disabled: !initialized },
  ];
  const signature = JSON.stringify(controls);
  if (signature === statusControlSignature) return;
  statusControlSignature = signature;
  void host.setStatusControls(controls).catch(() => {
    statusControlsSupported = false;
    statusControlSignature = '';
    actions.hidden = false;
  });
};

const refresh = async () => {
  if (busy) return;
  busy = true;
  button.update({ loading: true });
  syncStatusControls();
  try {
    const loaded = await repo.load(false);
    title.textContent = currentLabel(loaded, t);
    title.title = title.textContent;
    const matched = Boolean(matchedProfile(loaded));
    dot.dataset.tone = loaded.status === 'applied' && matched
      ? 'success'
      : loaded.status === 'drifted' || loaded.status === 'baseline' || (loaded.status === 'applied' && !matched)
        ? 'warning'
        : 'neutral';
    const time = new Date().toLocaleTimeString(i18n.locale, { hour: '2-digit', minute: '2-digit' });
    const body = loaded.current.exists && !isStub(loaded.current.content) ? extractBody(loaded.current.content) : '';
    const tokens = body ? estimateTokens(body) : 0;
    note.textContent = tokens > 0
      ? t('~{tokens} tokens · 读取于 {time}', { tokens: tokens.toLocaleString(i18n.locale), time })
      : t('读取于 {time}', { time });
    message.hidden = true;
  } catch (error) {
    dot.dataset.tone = 'error';
    title.textContent = t('未读取');
    note.textContent = TARGET_PATH;
    message.textContent = explainError(error, t);
    message.dataset.tone = 'error';
    message.hidden = false;
  } finally {
    busy = false;
    button.update({ loading: false });
    syncStatusControls();
  }
};

const button = mountButton(actions, { label: t('刷新'), size: 'sm', variant: 'ghost', onClick: () => { void refresh(); } });
const manage = mountButton(actions, { label: t('管理'), size: 'sm', variant: 'ghost', onClick: triggerManage });
const manageButton = actions.lastElementChild!;
manageButton.setAttribute('aria-label', t('管理内置提示词'));

host.onStatusControl((event) => {
  if (event.id === 'refresh') void refresh();
  else if (event.id === 'manage') triggerManage();
});

host.onDirectory(() => {
  if (!initialized) return;
  statusControlSignature = '';
  syncStatusControls();
});

new ResizeObserver(() => {
  void host.setHeight(Math.ceil(app.getBoundingClientRect().height)).catch(() => {});
}).observe(app);

host.onReady((context) => {
  applyHostReady(context, document.documentElement);
  const changed = i18n.setLocale(context.locale);
  applyDocumentLanguage(i18n);
  rowLabel.textContent = t('当前方案');
  note.title = t('仅表示当前连接服务器的文件状态，不代表已有会话已重新加载提示词。');
  button.update({ label: t('刷新') });
  manage.update({ label: t('管理') });
  manageButton.setAttribute('aria-label', t('管理内置提示词'));
  statusControlsSupported = context.surface === 'status' && context.features?.statusControls === true;
  if (!initialized) {
    initialized = true;
    syncStatusControls();
    void refresh();
  } else {
    statusControlSignature = '';
    syncStatusControls();
    if (changed) {
      note.textContent = TARGET_PATH;
      void refresh();
    }
  }
});
