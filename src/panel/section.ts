import { connectHost, type GuestStatusControl } from '@openchamber/sdk';
import { applyHostReady, mountButton } from '@openchamber/sdk/ui';
import { createRepository } from '../core/repository.ts';
import { explainError, hostFiles } from '../platform/host-files.ts';
import { el, statusLabel, statusShort } from './view.ts';
import native from '../../ui/native.css';
import { openManager } from '../../ui/navigation.ts';
import layout from './styles/layout.css';
import components from './styles/components.css';
import { applyDocumentLanguage, i18n } from './i18n.ts';

const { t } = i18n;
const style = document.createElement('style');
style.textContent = native + layout + components;
document.head.append(style);

const host = connectHost();
const repo = createRepository(hostFiles(host, t), Date.now, () => crypto.randomUUID(), t);
const app = el('section', 'ext po-section');
const value = el('p', 'po-status-value', t('正在读取…'));
value.setAttribute('role', 'status');
const row = el('div', 'po-status-row');
const rowLabel = el('span', 'po-status-label', t('当前状态'));
row.append(rowLabel, value);
const note = el('p', 'ext-muted', 'build.md');
note.title = t('仅表示当前连接服务器的文件状态，不代表已有会话已加载规则。');
const message = el('p', 'ext-notice');
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
  void openManager(host, { id: 'prompt-override', name: t('内置提示词') }).catch((error: unknown) => {
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

host.onStatusControl((event) => {
  if (event.id === 'refresh') void refresh();
  else if (event.id === 'manage') triggerManage();
});

const refresh = async () => {
  if (busy) return;
  busy = true;
  button.update({ loading: true });
  syncStatusControls();
  try {
    const loaded = await repo.load();
    value.textContent = statusShort(loaded.status, t);
    value.setAttribute('data-status', loaded.status);
    value.title = statusLabel(loaded.status, t);
    note.textContent = t('读取于 {time}', { time: new Date().toLocaleTimeString(i18n.locale, { hour: '2-digit', minute: '2-digit', hour12: false }) });
    message.hidden = true;
    void host.setBadge(loaded.status === 'drifted' || loaded.status === 'missing' ? 1 : null).catch(() => {});
  } catch (error) {
    value.textContent = t('未读取');
    value.removeAttribute('data-status');
    note.textContent = 'build.md';
    message.textContent = explainError(error, t);
    message.dataset.tone = 'error';
    message.hidden = false;
  } finally {
    busy = false;
    button.update({ loading: false });
    syncStatusControls();
    void host.setHeight(Math.ceil(app.getBoundingClientRect().height)).catch(() => {});
  }
};

const button = mountButton(actions, { label: t('刷新'), size: 'sm', variant: 'ghost', onClick: () => { void refresh(); } });
const manage = mountButton(actions, {
  label: t('管理'),
  size: 'sm',
  variant: 'ghost',
  onClick: triggerManage,
});
const manageButton = actions.lastElementChild!;
manageButton.setAttribute('aria-label', t('管理内置提示词'));

new ResizeObserver(() => {
  void host.setHeight(Math.ceil(app.getBoundingClientRect().height)).catch(() => {});
}).observe(app);

host.onReady((context) => {
  applyHostReady(context, document.documentElement);
  const changed = i18n.setLocale(context.locale);
  applyDocumentLanguage(i18n);
  statusControlsSupported = context.features?.statusControls === true;
  statusControlSignature = '';
  rowLabel.textContent = t('当前状态');
  note.title = t('仅表示当前连接服务器的文件状态，不代表已有会话已加载规则。');
  button.update({ label: t('刷新') });
  manage.update({ label: t('管理') });
  manageButton.setAttribute('aria-label', t('管理内置提示词'));
  syncStatusControls();
  if (!initialized) {
    initialized = true;
    void refresh();
  } else if (changed) {
    void refresh();
  }
});
