const params = new URLSearchParams(location.search);
let section = params.get('surface') === 'status';
const darkQuery = matchMedia('(prefers-color-scheme: dark)');
let dark = darkQuery.matches;

const target = '~/.config/opencode/agents/build.md';
const dataDir = '~/.config/openchamber/prompt-override';
const statePath = `${dataDir}/state.json`;
const backupDir = `${dataDir}/backups`;
const stub = '---\nmode: all\n---\n\n';

const frame = document.querySelector('iframe');
const disk = new Map([[target, stub]]);

const tokens = dark => ({
  background: dark ? '#20201e' : '#faf9f7',
  elevated: dark ? '#282724' : '#f2f1ee',
  foreground: dark ? '#dedbd3' : '#484744',
  muted: dark ? '#a7a39b' : '#77736c',
  subtle: dark ? '#817d76' : '#a29e98',
  border: dark ? '#3c3a35' : '#e3e0db',
  hover: dark ? '#ffffff0a' : '#00000005',
  selection: dark ? '#4a3327' : '#f2e6dc',
  focus: '#b07750',
  primary: dark ? '#d59a6f' : '#a4663b',
  mutedSurface: dark ? '#272622' : '#f1efec',
  elevatedForeground: dark ? '#dedbd3' : '#484744',
  active: dark ? '#ffffff12' : '#00000009',
  selectionForeground: dark ? '#f2d4bc' : '#724324',
  primaryForeground: '#ffffff',
  primaryText: dark ? '#e3b18c' : '#965421',
  successText: dark ? '#a0b48c' : '#4f6a3b',
  warningText: dark ? '#d6b774' : '#8b6322',
  errorText: dark ? '#e39b8b' : '#b34635',
  infoText: dark ? '#9eb4c9' : '#496d88',
  success: '#759862',
  warning: '#c3944d',
  error: '#ce6a55',
  info: '#6995bb',
  font: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  mono: 'ui-monospace,SFMono-Regular,monospace',
  radius: '7px',
});

const ready = () => frame.contentWindow.postMessage({
  channel: 'openchamber.sdk',
  v: 1,
  type: 'ready',
  payload: {
    theme: { mode: dark ? 'dark' : 'light', tokens: tokens(dark) },
    locale: 'zh-CN',
    directory: '/fixture/project',
    session: null,
    surface: section ? 'status' : 'panel',
    connection: { connected: true, account: 'fixture' },
    settings: {},
    item: null,
  },
}, '*');

const result = (source, id, payload) => source.postMessage({ channel: 'openchamber.sdk', v: 1, type: 'result', id, ok: true, payload }, '*');
const reject = (source, id, code, error) => source.postMessage({ channel: 'openchamber.sdk', v: 1, type: 'result', id, ok: false, code, error }, '*');

const show = () => {
  frame.src = section ? '/panel/section.html' : '/panel/index.html';
  document.body.dataset.surface = section ? 'status' : 'panel';
};

window.addEventListener('message', async event => {
  const msg = event.data;
  if (event.source !== frame.contentWindow || msg?.channel !== 'openchamber.sdk') return;
  if (msg.type === 'hello') { ready(); return; }
  if (msg.type === 'open-surface') {
    if (msg.payload?.surfaceId !== 'plugin:prompt-override') { reject(event.source, msg.id, 'HOST_REJECTED', 'Unknown surface.'); return; }
    result(event.source, msg.id);
    section = false;
    show();
    return;
  }
  if (msg.type === 'set-height') { result(event.source, msg.id); return; }
  if (!msg.type.startsWith('file-')) { result(event.source, msg.id); return; }
  await new Promise(resolve => setTimeout(resolve, 40));
  const { path, content } = msg.payload ?? {};
  if (path !== target && path !== statePath && !path.startsWith(`${dataDir}/`)) {
    reject(event.source, msg.id, 'BAD_PATH', 'Fixture path outside grant');
    return;
  }
  if (msg.type === 'file-read') {
    if (disk.has(path)) result(event.source, msg.id, { content: disk.get(path) });
    else reject(event.source, msg.id, 'NOT_FOUND', 'Fixture missing file');
  } else if (msg.type === 'file-write') {
    disk.set(path, content);
    result(event.source, msg.id, { written: true });
  } else if (msg.type === 'file-list') {
    const prefix = `${path}/`;
    result(event.source, msg.id, {
      entries: [...disk.keys()]
        .filter(key => key.startsWith(prefix))
        .map(key => key.slice(prefix.length))
        .filter(name => !name.includes('/'))
        .map(name => ({ name, kind: 'file' })),
    });
  }
});

darkQuery.addEventListener('change', event => { dark = event.matches; ready(); });
show();
