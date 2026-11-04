import { mountButton, mountSelect, mountTabs, mountTextField, type ButtonHandle, type ButtonVariant } from '@openchamber/sdk/ui';
import type { I18n, Translate } from '../shared/i18n.ts';
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

export const statusLabel = (status: Status, t: Translate = source => source): string => {
  if (status === 'builtin') return t('使用内置提示词');
  if (status === 'baseline') return t('使用基线内容');
  if (status === 'applied') return t('已应用覆盖');
  if (status === 'drifted') return t('文件已被外部修改');
  return t('build.md 缺失');
};

export const statusShort = (status: Status, t: Translate = source => source): string => {
  if (status === 'builtin') return t('内置');
  if (status === 'baseline') return t('基线');
  if (status === 'applied') return t('已覆盖');
  if (status === 'drifted') return t('外部修改');
  return t('缺失');
};

export const baselineLabel = (label: string, t: Translate): string => (
  label.startsWith('内置提示词基线 · ')
    ? t('内置提示词基线 · {date}', { date: label.slice('内置提示词基线 · '.length) })
    : label
);

export const mountView = (root: HTMLElement, i18n: I18n, callbacks: {
  action: (action: Action) => void;
  tab: (id: string) => void;
  backup: (id: string) => void;
  custom: (value: string) => void;
}) => {
  const { t, locale } = i18n;
  const app = el('main', 'ext po');
  const header = el('header', 'po-header');
  const kickerRow = el('div', 'po-kicker-row');
  const refreshSlot = el('div', 'po-refresh');
  const kicker = el('p', 'ext-muted po-kicker', t('当前 build 提示词'));
  kickerRow.append(kicker, refreshSlot);
  const title = el('h1', 'po-title', t('正在连接 OpenChamber…'));
  const context = el('p', 'ext-muted po-context', t('当前 OpenCode · build agent'));
  const tabsSlot = el('div', 'po-tabs');
  header.append(kickerRow, title, context, tabsSlot);

  const scroll = el('div', 'po-scroll');
  const message = el('p', 'ext-notice po-message');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');

  const overview = el('section', 'po-stack');
  overview.setAttribute('aria-label', t('内置提示词状态'));
  const meta = el('dl', 'po-meta');
  const baselineDd = el('dd', '', t('尚未建立基线'));
  const targetDt = el('dt', '', t('目标文件'));
  const baselineDt = el('dt', '', t('基线'));
  meta.append(targetDt, el('dd', '', ''), baselineDt, baselineDd);
  const targetDd = meta.querySelector('dd')!;
  const targetCode = el('code', '', TARGET_PATH);
  targetCode.title = TARGET_PATH;
  targetDd.append(targetCode);
  const hint = el('p', 'ext-muted po-hint', t('替换 build 的 system prompt；AGENTS.md 仍追加。影响所有项目与 provider。'));
  overview.append(meta, hint);

  const review = el('section', 'po-stack po-review');
  review.setAttribute('aria-label', t('覆盖差异预览'));
  const reviewTitle = el('h2', 'po-review-title');
  const reviewNote = el('p', 'ext-notice po-review-note');
  const reviewSummary = el('p', 'ext-muted po-review-summary');
  reviewSummary.setAttribute('aria-live', 'polite');
  const reviewHint = el('p', 'ext-muted po-review-hint', t('确认前请检查下方差异；写入前会备份当前 build.md。'));
  const diff = el('div', 'po-diff');
  diff.tabIndex = 0;
  diff.setAttribute('aria-label', t('差异，左侧为原行号，右侧为新行号'));
  const reviewActions = el('div', 'ext-actions po-review-actions');
  review.append(reviewTitle, reviewNote, reviewSummary, reviewHint, diff, reviewActions);

  const custom = el('section', 'po-stack po-editor');
  custom.setAttribute('aria-label', t('覆盖内容'));
  const customField = el('div', 'po-field');
  custom.append(customField);

  const backups = el('section', 'po-stack');
  backups.setAttribute('aria-label', t('build 提示词备份'));
  const backupSelectSlot = el('div');
  const backupNote = el('p', 'ext-muted po-hint');
  const backupText = el('pre', 'po-preview');
  backupText.tabIndex = 0;
  backupText.setAttribute('aria-label', t('备份内容'));
  const backupActions = el('div', 'ext-actions');
  backups.append(backupNote, backupSelectSlot, backupText, backupActions);

  const footer = el('footer', 'po-footer');
  const footerHint = el('p', 'ext-muted', t('应用或还原都会先预览差异；写入前会备份当前 build.md。'));
  footer.append(footerHint);
  const footerActions = el('div', 'ext-actions');
  footer.append(footerActions);

  scroll.append(message, overview, review, custom, backups);
  app.append(header, scroll, footer);
  root.append(app);

  const buttons = new Map<Action, ButtonHandle>();
  const button = (slot: HTMLElement, action: Action, label: string, variant: ButtonVariant = 'ghost') => {
    const handle = mountButton(slot, { label: t(label), size: 'sm', variant, onClick: () => callbacks.action(action) });
    buttons.set(action, handle);
  };
  button(refreshSlot, 'refresh', '刷新');
  button(footerActions, 'restore', '还原内置', 'outline');
  button(footerActions, 'applyBundled', '应用覆盖', 'default');
  button(reviewActions, 'cancel', '返回编辑', 'outline');
  button(reviewActions, 'confirm', '确认写入', 'default');
  button(backupActions, 'backupRestore', '预览恢复', 'outline');

  const tabs = mountTabs(tabsSlot, {
    items: [{ id: 'override', label: t('覆盖') }, { id: 'backups', label: t('备份') }],
    activeId: 'override',
    onChange: callbacks.tab,
  });
  const editor = mountTextField(customField, {
    label: t('覆盖内容 · Markdown'),
    value: '',
    mono: true,
    multiline: true,
    rows: 12,
    placeholder: t('在这里填写 build agent 的 system prompt 正文…'),
    onChange: callbacks.custom,
  });
  const backupSelect = mountSelect(backupSelectSlot, {
    label: t('备份时间'),
    value: null,
    options: [],
    searchable: true,
    searchPlaceholder: t('搜索时间…'),
    placeholder: t('选择备份'),
    onChange: callbacks.backup,
  });

  let lastTab = 'override';
  let lastReview: Review | null = null;
  const paintReview = (item: Review) => {
    const result = diffLines(item.before.content, item.content);
    diff.replaceChildren();
    reviewTitle.textContent = item.label;
    reviewNote.textContent = item.kind === 'restore'
      ? t('此操作会写回基线 stub，恢复内置提示词。')
      : item.kind === 'backup'
        ? t('此操作会写回选中的备份内容。')
        : t('此操作会替换 build.md 的正文，影响所有项目和 provider。');
    reviewNote.dataset.tone = item.kind === 'restore' ? 'warning' : 'info';
    reviewSummary.textContent = t('新增 {added} 行 · 删除 {removed} 行', { added: result.added, removed: result.removed })
      + (result.coarse ? t(' · 大段变更按整块展示') : '')
      + (item.before.exists && item.before.content === item.content ? t(' · 内容一致，无需写入') : '')
      + (!item.before.exists ? t(' · 将创建文件') : '');
    let shown = 0, skipped = 0;
    const gap = () => { if (skipped) { diff.append(el('p', 'po-diff-gap', t('省略 {count} 行未变更内容', { count: skipped }))); skipped = 0; } };
    for (let i = 0; i < result.lines.length; i++) {
      const line = result.lines[i];
      if (line.kind === 'same' && i > 2 && i < result.lines.length - 3 && result.lines.slice(Math.max(0, i - 3), i + 4).every(row => row.kind === 'same')) { skipped++; continue; }
      if (shown >= 400) { gap(); diff.append(el('p', 'po-diff-gap', t('预览达到 400 行，后续差异未展示。请返回编辑或备份内容检查完整文本。'))); break; }
      gap(); shown++;
      const row = el('div', 'po-diff-line');
      row.dataset.kind = line.kind;
      row.append(el('span', '', String(line.oldLine ?? '')), el('span', '', String(line.newLine ?? '')), el('span', '', line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : ' '), el('code', '', line.text));
      diff.append(row);
    }
    gap();
    if (!result.lines.length) diff.append(el('p', 'po-diff-gap', t('文件内容为空')));
  };
  const localize = () => {
    kicker.textContent = t('当前 build 提示词');
    context.textContent = t('当前 OpenCode · build agent');
    overview.setAttribute('aria-label', t('内置提示词状态'));
    targetDt.textContent = t('目标文件');
    baselineDt.textContent = t('基线');
    hint.textContent = t('替换 build 的 system prompt；AGENTS.md 仍追加。影响所有项目与 provider。');
    review.setAttribute('aria-label', t('覆盖差异预览'));
    reviewHint.textContent = t('确认前请检查下方差异；写入前会备份当前 build.md。');
    diff.setAttribute('aria-label', t('差异，左侧为原行号，右侧为新行号'));
    custom.setAttribute('aria-label', t('覆盖内容'));
    backups.setAttribute('aria-label', t('build 提示词备份'));
    backupText.setAttribute('aria-label', t('备份内容'));
    footerHint.textContent = t('应用或还原都会先预览差异；写入前会备份当前 build.md。');
    buttons.get('refresh')!.update({ label: t('刷新') });
    buttons.get('restore')!.update({ label: t('还原内置') });
    buttons.get('applyBundled')!.update({ label: t('应用覆盖') });
    buttons.get('cancel')!.update({ label: t('返回编辑') });
    buttons.get('backupRestore')!.update({ label: t('预览恢复') });
    tabs.update({ items: [{ id: 'override', label: t('覆盖') }, { id: 'backups', label: t('备份') }] });
    editor.update({ label: t('覆盖内容 · Markdown'), placeholder: t('在这里填写 build agent 的 system prompt 正文…') });
    backupSelect.update({ label: t('备份时间'), searchPlaceholder: t('搜索时间…'), placeholder: t('选择备份') });
    lastReview = null;
    lastTab = '';
  };

  return {
    localize,
    render(state: State) {
      const loaded = state.loaded;
      const status = loaded?.status;
      const blocked = state.busy || !loaded || Boolean(state.review);
      title.textContent = loaded ? statusLabel(status!, t) : state.busy ? t('正在读取…') : t('尚未读取');
      baselineDd.textContent = loaded?.state ? baselineLabel(loaded.state.baselineLabel, t) : t('尚未建立基线');
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
        label: state.review?.kind === 'restore' ? t('确认还原') : state.review?.kind === 'backup' ? t('确认恢复') : t('确认写入'),
      });
      editor.update({
        value: state.custom,
        disabled: state.busy || Boolean(state.review),
        helper: `${t('{count} 字符', { count: state.custom.length.toLocaleString(locale) })}${state.customDirty ? t(' · 未应用') : ''}`,
      });
      backupSelect.update({
        value: state.backupId,
        disabled: state.busy || Boolean(state.review),
        options: state.backups.map(id => ({ id, label: new Date(Number(id.split('-')[0])).toLocaleString(locale), hint: id.slice(-4) })),
      });
      backupNote.textContent = state.backups.length ? t('显示最近 {count} 份备份；恢复前也会备份当前文件。', { count: state.backups.length }) : t('暂无备份。首次应用或还原时会自动创建。');
      backupText.hidden = !state.backup;
      backupText.textContent = state.backup?.content ?? '';
      backupText.setAttribute('aria-label', state.backup?.label ?? t('备份内容'));
      buttons.get('backupRestore')!.update({ disabled: blocked || !state.backupId, loading: state.busy && Boolean(state.review) });

      if (state.review !== lastReview) {
        lastReview = state.review;
        if (state.review) { paintReview(state.review); scroll.scrollTop = 0; }
      }
    },
  };
};
