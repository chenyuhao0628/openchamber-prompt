import { mountButton, mountSelect, mountTabs, mountTextField, type ButtonHandle, type ButtonVariant } from '@openchamber/sdk/ui';
import { diffLines } from '../core/diff.ts';
import { TARGET_PATH, type Backup, type Loaded, type Review, type Status } from '../core/types.ts';

export type State = {
  loaded: Loaded | null;
  busy: boolean;
  review: Review | null;
  reviewInvalid: boolean;
  message: string;
  tone: 'info' | 'success' | 'error' | 'warning';
  tab: 'override' | 'backups';
  backups: string[];
  backupId: string | null;
  backup: Backup | null;
  custom: string;
  customDirty: boolean;
};
export type Action = 'refresh' | 'applyBundled' | 'restore' | 'confirm' | 'cancel' | 'backupRestore';

export const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export const statusLabel = (status: Status): string => {
  if (status === 'builtin') return '使用内置提示词';
  if (status === 'baseline') return '使用基线内容';
  if (status === 'applied') return '已应用覆盖';
  if (status === 'drifted') return '文件已被外部修改';
  return 'build.md 缺失';
};

export const statusShort = (status: Status): string => {
  if (status === 'builtin') return '内置';
  if (status === 'baseline') return '基线';
  if (status === 'applied') return '已覆盖';
  if (status === 'drifted') return '外部修改';
  return '缺失';
};

export const mountView = (root: HTMLElement, callbacks: {
  action: (action: Action) => void;
  tab: (id: string) => void;
  backup: (id: string) => void;
  custom: (value: string) => void;
}) => {
  const app = el('main', 'ext po');
  const header = el('header', 'po-header');
  const kickerRow = el('div', 'po-kicker-row');
  const refreshSlot = el('div', 'po-refresh');
  kickerRow.append(el('p', 'ext-muted po-kicker', '当前 build 提示词'), refreshSlot);
  const title = el('h1', 'po-title', '正在连接 OpenChamber…');
  const context = el('p', 'ext-muted po-context', '当前 OpenCode · build agent');
  const tabsSlot = el('div', 'po-tabs');
  header.append(kickerRow, title, context, tabsSlot);

  const scroll = el('div', 'po-scroll');
  const message = el('p', 'ext-notice po-message');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');

  const overview = el('section', 'po-stack');
  overview.setAttribute('aria-label', '内置提示词状态');
  const meta = el('dl', 'po-meta');
  const baselineDd = el('dd', '', '尚未建立基线');
  meta.append(el('dt', '', '目标文件'), el('dd', '', ''), el('dt', '', '基线'), baselineDd);
  const targetDd = meta.querySelector('dd')!;
  const targetCode = el('code', '', TARGET_PATH);
  targetCode.title = TARGET_PATH;
  targetDd.append(targetCode);
  const hint = el('p', 'ext-muted po-hint', '替换 build 的 system prompt；AGENTS.md 仍追加。影响所有项目与 provider。');
  overview.append(meta, hint);

  const review = el('section', 'po-stack po-review');
  review.setAttribute('aria-label', '覆盖差异预览');
  const reviewTitle = el('h2', 'po-review-title');
  const reviewNote = el('p', 'ext-notice po-review-note');
  const reviewSummary = el('p', 'ext-muted po-review-summary');
  reviewSummary.setAttribute('aria-live', 'polite');
  const reviewHint = el('p', 'ext-muted po-review-hint', '确认前请检查下方差异；写入前会备份当前 build.md。');
  const diff = el('div', 'po-diff');
  diff.tabIndex = 0;
  diff.setAttribute('aria-label', '差异，左侧为原行号，右侧为新行号');
  const reviewActions = el('div', 'ext-actions po-review-actions');
  review.append(reviewTitle, reviewNote, reviewSummary, reviewHint, diff, reviewActions);

  const custom = el('section', 'po-stack po-editor');
  custom.setAttribute('aria-label', '覆盖内容');
  const customField = el('div', 'po-field');
  custom.append(customField);

  const backups = el('section', 'po-stack');
  backups.setAttribute('aria-label', 'build 提示词备份');
  const backupSelectSlot = el('div');
  const backupNote = el('p', 'ext-muted po-hint');
  const backupText = el('pre', 'po-preview');
  backupText.tabIndex = 0;
  backupText.setAttribute('aria-label', '备份内容');
  const backupActions = el('div', 'ext-actions');
  backups.append(backupNote, backupSelectSlot, backupText, backupActions);

  const footer = el('footer', 'po-footer');
  footer.append(el('p', 'ext-muted', '应用或还原都会先预览差异；写入前会备份当前 build.md。'));
  const footerActions = el('div', 'ext-actions');
  footer.append(footerActions);

  scroll.append(message, overview, review, custom, backups);
  app.append(header, scroll, footer);
  root.append(app);

  const buttons = new Map<Action, ButtonHandle>();
  const button = (slot: HTMLElement, action: Action, label: string, variant: ButtonVariant = 'ghost') => {
    const handle = mountButton(slot, { label, size: 'sm', variant, onClick: () => callbacks.action(action) });
    buttons.set(action, handle);
  };
  button(refreshSlot, 'refresh', '刷新');
  button(footerActions, 'restore', '还原内置', 'outline');
  button(footerActions, 'applyBundled', '应用覆盖', 'default');
  button(reviewActions, 'cancel', '返回编辑', 'outline');
  button(reviewActions, 'confirm', '确认写入', 'default');
  button(backupActions, 'backupRestore', '预览恢复', 'outline');

  const tabs = mountTabs(tabsSlot, {
    items: [{ id: 'override', label: '覆盖' }, { id: 'backups', label: '备份' }],
    activeId: 'override',
    onChange: callbacks.tab,
  });
  const editor = mountTextField(customField, {
    label: '覆盖内容 · Markdown',
    value: '',
    mono: true,
    multiline: true,
    rows: 12,
    placeholder: '在这里填写 build agent 的 system prompt 正文…',
    onChange: callbacks.custom,
  });
  const backupSelect = mountSelect(backupSelectSlot, {
    label: '备份时间',
    value: null,
    options: [],
    searchable: true,
    searchPlaceholder: '搜索时间…',
    placeholder: '选择备份',
    onChange: callbacks.backup,
  });

  let lastTab = 'override';
  let lastReview: Review | null = null;
  const paintReview = (item: Review) => {
    const result = diffLines(item.before.content, item.content);
    diff.replaceChildren();
    reviewTitle.textContent = item.label;
    reviewNote.textContent = item.kind === 'restore'
      ? '此操作会写回基线 stub，恢复内置提示词。'
      : item.kind === 'backup'
        ? '此操作会写回选中的备份内容。'
        : '此操作会替换 build.md 的正文，影响所有项目和 provider。';
    reviewNote.dataset.tone = item.kind === 'restore' ? 'warning' : 'info';
    reviewSummary.textContent = `新增 ${result.added} 行 · 删除 ${result.removed} 行${result.coarse ? ' · 大段变更按整块展示' : ''}${item.before.exists && item.before.content === item.content ? ' · 内容一致，无需写入' : ''}${!item.before.exists ? ' · 将创建文件' : ''}`;
    let shown = 0, skipped = 0;
    const gap = () => { if (skipped) { diff.append(el('p', 'po-diff-gap', `省略 ${skipped} 行未变更内容`)); skipped = 0; } };
    for (let i = 0; i < result.lines.length; i++) {
      const line = result.lines[i];
      if (line.kind === 'same' && i > 2 && i < result.lines.length - 3 && result.lines.slice(Math.max(0, i - 3), i + 4).every(row => row.kind === 'same')) { skipped++; continue; }
      if (shown >= 400) { gap(); diff.append(el('p', 'po-diff-gap', '预览达到 400 行，后续差异未展示。请返回编辑或备份内容检查完整文本。')); break; }
      gap(); shown++;
      const row = el('div', 'po-diff-line');
      row.dataset.kind = line.kind;
      row.append(el('span', '', String(line.oldLine ?? '')), el('span', '', String(line.newLine ?? '')), el('span', '', line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : ' '), el('code', '', line.text));
      diff.append(row);
    }
    gap();
    if (!result.lines.length) diff.append(el('p', 'po-diff-gap', '文件内容为空'));
  };

  return {
    render(state: State) {
      const loaded = state.loaded;
      const status = loaded?.status;
      const blocked = state.busy || !loaded || Boolean(state.review);
      title.textContent = loaded ? statusLabel(status!) : state.busy ? '正在读取…' : '尚未读取';
      baselineDd.textContent = loaded?.state ? loaded.state.baselineLabel : '尚未建立基线';
      message.hidden = !state.message;
      message.textContent = state.message;
      message.dataset.tone = state.tone;

      if (state.tab !== lastTab) { tabs.update({ activeId: state.tab }); lastTab = state.tab; }
      tabsSlot.hidden = Boolean(state.review);
      overview.hidden = Boolean(state.review) || state.tab !== 'override';
      custom.hidden = Boolean(state.review) || state.tab !== 'override';
      review.hidden = !state.review;
      backups.hidden = Boolean(state.review) || state.tab !== 'backups';
      footer.hidden = Boolean(state.review) || state.tab !== 'override';

      for (const handle of buttons.values()) handle.update({ disabled: blocked });
      buttons.get('refresh')!.update({ disabled: state.busy, loading: state.busy && !loaded });
      buttons.get('applyBundled')!.update({ disabled: blocked || !state.custom.trim() });
      buttons.get('restore')!.update({ disabled: blocked || status === 'builtin' || status === 'baseline' });
      buttons.get('confirm')!.update({
        disabled: state.busy || state.reviewInvalid || !state.review || (state.review.before.exists && state.review.before.content === state.review.content),
        label: state.review?.kind === 'restore' ? '确认还原' : state.review?.kind === 'backup' ? '确认恢复' : '确认写入',
      });
      editor.update({
        value: state.custom,
        disabled: state.busy || Boolean(state.review),
        helper: `${state.custom.length.toLocaleString('zh-CN')} 字符${state.customDirty ? ' · 未应用' : ''}`,
      });
      backupSelect.update({
        value: state.backupId,
        disabled: state.busy || Boolean(state.review),
        options: state.backups.map(id => ({ id, label: new Date(Number(id.split('-')[0])).toLocaleString('zh-CN'), hint: id.slice(-4) })),
      });
      backupNote.textContent = state.backups.length ? `显示最近 ${state.backups.length} 份备份；恢复前也会备份当前文件。` : '暂无备份。首次应用或还原时会自动创建。';
      backupText.hidden = !state.backup;
      backupText.textContent = state.backup?.content ?? '';
      backupText.setAttribute('aria-label', state.backup?.label ?? '备份内容');
      buttons.get('backupRestore')!.update({ disabled: blocked || !state.backupId, loading: state.busy && Boolean(state.review) });

      if (state.review !== lastReview) {
        lastReview = state.review;
        if (state.review) { paintReview(state.review); scroll.scrollTop = 0; }
      }
    },
  };
};
