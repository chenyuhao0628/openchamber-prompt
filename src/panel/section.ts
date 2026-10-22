import { connectHost } from '@openchamber/sdk';
import { applyHostReady, mountButton } from '@openchamber/sdk/ui';
import { createRepository } from '../core/repository.ts';
import { explainError, hostFiles } from '../platform/host-files.ts';
import { el, statusLabel, statusShort } from './view.ts';
import native from '../../ui/native.css';
import layout from './styles/layout.css';
import components from './styles/components.css';

const style = document.createElement('style');
style.textContent = native + layout + components;
document.head.append(style);

const host = connectHost();
const repo = createRepository(hostFiles(host));
const app = el('section', 'ext po-section');
const value = el('p', 'po-status-value', '正在读取…');
value.setAttribute('role', 'status');
const row = el('div', 'po-status-row');
row.append(el('span', 'po-status-label', '当前状态'), value);
const note = el('p', 'ext-muted', 'build.md');
note.title = '仅表示当前连接服务器的文件状态，不代表已有会话已加载规则。';
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
const refresh = async () => {
  if (busy) return;
  busy = true;
  button.update({ loading: true });
  try {
    const loaded = await repo.load();
    value.textContent = statusShort(loaded.status);
    value.setAttribute('data-status', loaded.status);
    value.title = statusLabel(loaded.status);
    note.textContent = `读取于 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    message.hidden = true;
  } catch (error) {
    value.textContent = '未读取';
    value.removeAttribute('data-status');
    note.textContent = 'build.md';
    message.textContent = explainError(error);
    message.dataset.tone = 'error';
    message.hidden = false;
  } finally {
    busy = false;
    button.update({ loading: false });
  }
};

const button = mountButton(actions, { label: '刷新', size: 'sm', variant: 'ghost', onClick: () => { void refresh(); } });
mountButton(actions, {
  label: '管理',
  size: 'sm',
  variant: 'ghost',
  onClick: () => {
    void host.openSurface('plugin:prompt-override').catch(error => {
      message.hidden = false;
      message.dataset.tone = 'error';
      message.textContent = explainError(error);
    });
  },
});
actions.lastElementChild!.setAttribute('aria-label', '管理内置提示词');

new ResizeObserver(() => { void host.setHeight(Math.ceil(app.getBoundingClientRect().height)).catch(() => {}); }).observe(app);
host.onReady(context => {
  applyHostReady(context, document.documentElement);
  if (!initialized) { initialized = true; void refresh(); }
});
