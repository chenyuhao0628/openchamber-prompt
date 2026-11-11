import {
  mountBadge,
  mountButton,
  mountSelect,
  mountTabs,
  mountTextField,
  type BadgeHandle,
  type ButtonHandle,
  type ButtonVariant,
  type Tone,
} from '@openchamber/sdk/ui';
import type { I18n, Translate } from '../shared/i18n.ts';
import { diffLines } from '../core/diff.ts';
import {
  TARGET_PATH,
  countLines,
  estimateTokens,
  extractBody,
  isStub,
  type Backup,
  type Loaded,
  type PromptPreset,
  type Review,
  type Status,
} from '../core/types.ts';

export type GuardIntent =
  | { kind: 'selectPreset'; id: string | null }
  | { kind: 'newDraft' }
  | { kind: 'loadDisk' };

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
  presets: PromptPreset[];
  selectedPresetId: string | null;
  presetError: string;
  savingPresetMode: 'closed' | 'save' | 'saveAs';
  presetNameDraft: string;
  pendingDeletePresetId: string | null;
  guard: GuardIntent | null;
  custom: string;
  customDirty: boolean;
};

export type Action =
  | 'refresh'
  | 'applyBundled'
  | 'restore'
  | 'confirm'
  | 'cancel'
  | 'backupRestore'
  | 'newDraft'
  | 'openSavePreset'
  | 'openSaveAsPreset'
  | 'confirmSavePreset'
  | 'cancelSavePreset'
  | 'askDeletePreset'
  | 'confirmDeletePreset'
  | 'cancelDeletePreset'
  | 'copyText'
  | 'copyTargetPath'
  | 'inspectDrift'
  | 'loadDiskBody'
  | 'confirmGuard'
  | 'cancelGuard';

export const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export const statusLabel = (status: Status, t: Translate = (source) => source): string => {
  if (status === 'builtin') return t('未覆盖（交回 OpenCode 默认）');
  if (status === 'baseline') return t('匹配基线快照');
  if (status === 'applied') return t('已应用覆盖');
  if (status === 'drifted') return t('文件已被外部修改');
  return t('build.md 缺失');
};

export const statusShort = (status: Status, t: Translate = (source) => source): string => {
  if (status === 'builtin') return t('未覆盖');
  if (status === 'baseline') return t('基线');
  if (status === 'applied') return t('已覆盖');
  if (status === 'drifted') return t('外部修改');
  return t('缺失');
};

export const statusTone = (status: Status | undefined): Tone => {
  if (status === 'applied') return 'success';
  if (status === 'baseline') return 'info';
  if (status === 'drifted') return 'warning';
  if (status === 'missing') return 'error';
  return 'neutral';
};

export const mountView = (root: HTMLElement, i18n: I18n, callbacks: {
  action: (action: Action) => void;
  tab: (id: string) => void;
  backup: (id: string) => void;
  preset: (id: string) => void;
  presetName: (value: string) => void;
  custom: (value: string) => void;
}) => {
  const { t } = i18n;
  const app = el('main', 'ext po');
  const header = el('header', 'po-header');
  const topRow = el('div', 'po-top-row');
  const titleWrap = el('div', 'po-title-wrap');
  const badgeSlot = el('span', 'po-badge-slot');
  const title = el('h1', 'po-title', t('正在连接 OpenChamber…'));
  titleWrap.append(badgeSlot, title);
  const refreshSlot = el('div', 'po-refresh');
  topRow.append(titleWrap, refreshSlot);
  const context = el('p', 'ext-muted po-context', t('当前 OpenCode · build agent'));
  const tabsSlot = el('div', 'po-tabs');
  header.append(topRow, context, tabsSlot);

  const scroll = el('div', 'po-scroll ext-container');
  const message = el('p', 'ext-notice po-message');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');

  const driftBanner = el('section', 'po-drift-banner');
  driftBanner.hidden = true;
  const driftText = el('p', 'po-drift-text', t('检测到 build.md 已被外部修改，扩展不会自动覆盖。'));
  const driftActions = el('div', 'ext-actions');
  driftBanner.append(driftText, driftActions);

  const overview = el('section', 'po-stack');
  overview.setAttribute('aria-label', t('build.md 覆盖状态'));
  const meta = el('dl', 'po-meta');
  const targetDt = el('dt', '', t('目标文件'));
  const targetDd = el('dd', 'po-target-dd');
  const targetCode = el('code', '', TARGET_PATH);
  targetCode.title = TARGET_PATH;
  const copyPathSlot = el('span', 'po-copy-inline');
  targetDd.append(targetCode, copyPathSlot);
  const baselineDt = el('dt', '', t('基线'));
  const baselineDd = el('dd', '', t('尚未建立基线'));
  meta.append(targetDt, targetDd, baselineDt, baselineDd);
  overview.append(meta);

  const presetSection = el('section', 'po-preset-section');
  presetSection.setAttribute('aria-label', t('提示词预设'));
  const presetSelectSlot = el('div', 'po-preset-select');
  const presetToolbar = el('div', 'ext-actions po-preset-toolbar');
  const presetErrorNote = el('p', 'ext-notice po-preset-error');
  presetErrorNote.dataset.tone = 'error';
  presetErrorNote.hidden = true;

  const saveBar = el('div', 'po-inline-panel');
  saveBar.hidden = true;
  const presetNameSlot = el('div', 'po-field');
  const saveBarActions = el('div', 'ext-actions po-inline-actions');
  saveBar.append(presetNameSlot, saveBarActions);

  const deleteConfirmBar = el('div', 'po-inline-panel po-danger-panel');
  deleteConfirmBar.hidden = true;
  const deleteConfirmText = el('p', 'po-inline-text');
  const deleteConfirmActions = el('div', 'ext-actions po-inline-actions');
  deleteConfirmBar.append(deleteConfirmText, deleteConfirmActions);

  const guardBar = el('div', 'po-inline-panel po-warning-panel');
  guardBar.hidden = true;
  const guardText = el('p', 'po-inline-text', t('当前草稿有未保存修改。是否放弃草稿并加载所选内容？'));
  const guardActions = el('div', 'ext-actions po-inline-actions');
  guardBar.append(guardText, guardActions);

  presetSection.append(presetSelectSlot, presetToolbar, presetErrorNote, saveBar, deleteConfirmBar, guardBar);

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
  backups.setAttribute('aria-label', t('build.md 覆盖备份'));
  const backupSelectSlot = el('div');
  const backupNote = el('p', 'ext-muted po-hint');
  const backupText = el('pre', 'po-preview');
  backupText.tabIndex = 0;
  backupText.setAttribute('aria-label', t('备份内容'));
  const backupActions = el('div', 'ext-actions');
  backups.append(backupNote, backupSelectSlot, backupText, backupActions);

  const footer = el('footer', 'po-footer');
  const footerHint = el('p', 'ext-muted', t('应用或还原都会先预览并备份。'));
  const footerActions = el('div', 'ext-actions');
  footer.append(footerHint, footerActions);

  scroll.append(message, driftBanner, overview, review, presetSection, custom, backups);
  app.append(header, scroll, footer);
  root.append(app);

  const statusBadge: BadgeHandle = mountBadge(badgeSlot, { label: t('正在读取…'), tone: 'neutral' });

  const buttons = new Map<Action, ButtonHandle>();
  const button = (slot: HTMLElement, action: Action, label: string, variant: ButtonVariant = 'ghost') => {
    const handle = mountButton(slot, { label: t(label), size: 'sm', variant, onClick: () => callbacks.action(action) });
    buttons.set(action, handle);
  };
  button(refreshSlot, 'refresh', '刷新');
  button(copyPathSlot, 'copyTargetPath', '复制路径');
  button(driftActions, 'inspectDrift', '对比外部差异', 'outline');
  button(driftActions, 'loadDiskBody', '读取磁盘正文', 'ghost');
  button(presetToolbar, 'newDraft', '新建草稿', 'ghost');
  button(presetToolbar, 'openSavePreset', '保存预设', 'outline');
  button(presetToolbar, 'openSaveAsPreset', '另存预设', 'ghost');
  button(presetToolbar, 'copyText', '复制全文', 'ghost');
  button(presetToolbar, 'askDeletePreset', '删除预设', 'ghost');
  button(saveBarActions, 'cancelSavePreset', '取消', 'ghost');
  button(saveBarActions, 'confirmSavePreset', '确认保存', 'default');
  button(deleteConfirmActions, 'cancelDeletePreset', '取消', 'ghost');
  button(deleteConfirmActions, 'confirmDeletePreset', '确认删除', 'destructive');
  button(guardActions, 'cancelGuard', '继续编辑', 'ghost');
  button(guardActions, 'confirmGuard', '放弃草稿并加载', 'outline');
  button(footerActions, 'restore', '还原为空（交回默认）', 'outline');
  button(footerActions, 'applyBundled', '应用覆盖', 'default');
  button(reviewActions, 'cancel', '返回编辑', 'outline');
  button(reviewActions, 'confirm', '确认写入', 'default');
  button(backupActions, 'backupRestore', '预览恢复', 'outline');

  const tabs = mountTabs(tabsSlot, {
    items: [{ id: 'override', label: t('覆盖') }, { id: 'backups', label: t('备份') }],
    activeId: 'override',
    trackBackground: true,
    onChange: callbacks.tab,
  });

  const presetSelect = mountSelect(presetSelectSlot, {
    label: t('提示词预设'),
    value: '__draft__',
    options: [{ id: '__draft__', label: t('自由草稿（未关联预设）') }],
    searchable: true,
    searchPlaceholder: t('搜索预设…'),
    placeholder: t('选择预设或编辑临时草稿'),
    onChange: callbacks.preset,
  });

  const presetNameField = mountTextField(presetNameSlot, {
    label: t('预设名称'),
    value: '',
    placeholder: t('例如：精简极速模式 / 严格重构模式'),
    onChange: callbacks.presetName,
  });
  const presetNameInput = presetNameSlot.querySelector('input');
  presetNameInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.isComposing || event.keyCode === 229) return;
      callbacks.action('confirmSavePreset');
    } else if (event.key === 'Escape') {
      event.preventDefault();
      callbacks.action('cancelSavePreset');
    }
  });

  const editor = mountTextField(customField, {
    label: t('覆盖内容'),
    value: '',
    mono: true,
    multiline: true,
    rows: 12,
    placeholder: t('填写 system prompt…'),
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

  let lastTab = '';
  let lastBackupCount = -1;
  let lastReview: Review | null = null;
  let lastSavingMode: State['savingPresetMode'] = 'closed';

  const paintReview = (item: Review) => {
    const result = diffLines(item.before.content, item.content);
    diff.replaceChildren();
    reviewTitle.textContent = item.label;
    reviewNote.textContent = item.kind === 'restore'
      ? t('写回空 stub，移除覆盖，交回 OpenCode 默认。')
      : item.kind === 'backup'
        ? t('此操作会写回选中的备份内容。')
        : item.kind === 'inspect'
          ? t('只读对比：左侧为扩展记录的上次状态，右侧为磁盘当前 build.md。')
          : t('此操作会替换 build.md 的正文，影响所有项目和 provider。');
    reviewNote.dataset.tone = item.kind === 'restore' || item.kind === 'inspect' ? 'warning' : 'info';
    reviewHint.hidden = item.kind === 'inspect';
    reviewSummary.textContent = t('新增 {added} 行 · 删除 {removed} 行', { added: result.added, removed: result.removed })
      + (result.coarse ? t(' · 大段变更按整块展示') : '')
      + (item.before.exists && item.before.content === item.content ? t(' · 内容一致，无需写入') : '')
      + (!item.before.exists ? t(' · 将创建文件') : '');
    let shown = 0;
    let skipped = 0;
    const gap = () => {
      if (skipped) {
        diff.append(el('p', 'po-diff-gap', t('省略 {count} 行未变更内容', { count: skipped })));
        skipped = 0;
      }
    };
    for (let i = 0; i < result.lines.length; i += 1) {
      const line = result.lines[i];
      if (line.kind === 'same' && i > 2 && i < result.lines.length - 3 && result.lines.slice(Math.max(0, i - 3), i + 4).every((row) => row.kind === 'same')) {
        skipped += 1;
        continue;
      }
      if (shown >= 400) {
        gap();
        diff.append(el('p', 'po-diff-gap', t('预览达到 400 行，后续差异未展示。请返回编辑或备份内容检查完整文本。')));
        break;
      }
      gap();
      shown += 1;
      const row = el('div', 'po-diff-line');
      row.dataset.kind = line.kind;
      row.append(
        el('span', '', String(line.oldLine ?? '')),
        el('span', '', String(line.newLine ?? '')),
        el('span', '', line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : ' '),
        el('code', '', line.text),
      );
      diff.append(row);
    }
    gap();
    if (!result.lines.length) diff.append(el('p', 'po-diff-gap', t('文件内容为空')));
  };

  const localize = () => {
    context.textContent = t('当前 OpenCode · build agent');
    driftText.textContent = t('检测到 build.md 已被外部修改，扩展不会自动覆盖。');
    overview.setAttribute('aria-label', t('build.md 覆盖状态'));
    targetDt.textContent = t('目标文件');
    baselineDt.textContent = t('基线');
    presetSection.setAttribute('aria-label', t('提示词预设'));
    guardText.textContent = t('当前草稿有未保存修改。是否放弃草稿并加载所选内容？');
    review.setAttribute('aria-label', t('覆盖差异预览'));
    reviewHint.textContent = t('确认前请检查下方差异；写入前会备份当前 build.md。');
    diff.setAttribute('aria-label', t('差异，左侧为原行号，右侧为新行号'));
    custom.setAttribute('aria-label', t('覆盖内容'));
    backups.setAttribute('aria-label', t('build.md 覆盖备份'));
    backupText.setAttribute('aria-label', t('备份内容'));
    footerHint.textContent = t('应用或还原都会先预览并备份。');
    buttons.get('refresh')!.update({ label: t('刷新') });
    buttons.get('copyTargetPath')!.update({ label: t('复制路径') });
    buttons.get('inspectDrift')!.update({ label: t('对比外部差异') });
    buttons.get('loadDiskBody')!.update({ label: t('读取磁盘正文') });
    buttons.get('newDraft')!.update({ label: t('新建草稿') });
    buttons.get('openSaveAsPreset')!.update({ label: t('另存预设') });
    buttons.get('copyText')!.update({ label: t('复制全文') });
    buttons.get('askDeletePreset')!.update({ label: t('删除预设') });
    buttons.get('cancelSavePreset')!.update({ label: t('取消') });
    buttons.get('confirmSavePreset')!.update({ label: t('确认保存') });
    buttons.get('cancelDeletePreset')!.update({ label: t('取消') });
    buttons.get('confirmDeletePreset')!.update({ label: t('确认删除') });
    buttons.get('cancelGuard')!.update({ label: t('继续编辑') });
    buttons.get('confirmGuard')!.update({ label: t('放弃草稿并加载') });
    buttons.get('restore')!.update({ label: t('还原为空（交回默认）') });
    buttons.get('applyBundled')!.update({ label: t('应用覆盖') });
    buttons.get('cancel')!.update({ label: t('返回编辑') });
    buttons.get('backupRestore')!.update({ label: t('预览恢复') });
    presetSelect.update({
      label: t('提示词预设'),
      searchPlaceholder: t('搜索预设…'),
      placeholder: t('选择预设或编辑临时草稿'),
    });
    presetNameField.update({
      label: t('预设名称'),
      placeholder: t('例如：精简极速模式 / 严格重构模式'),
    });
    editor.update({ label: t('覆盖内容'), placeholder: t('填写 system prompt…') });
    backupSelect.update({ label: t('备份时间'), searchPlaceholder: t('搜索时间…'), placeholder: t('选择备份') });
    lastReview = null;
    lastTab = '';
    lastBackupCount = -1;
  };

  return {
    localize,
    focusPresetName() {
      presetNameInput?.focus();
      presetNameInput?.select();
    },
    render(state: State) {
      const { locale } = i18n;
      const loaded = state.loaded;
      const status = loaded?.status;
      const blocked = state.busy || !loaded || Boolean(state.review);

      statusBadge.update({
        label: loaded ? statusShort(status!, t) : state.busy ? t('正在读取…') : t('尚未读取'),
        tone: loaded ? statusTone(status) : 'neutral',
      });
      title.textContent = loaded ? statusLabel(status!, t) : state.busy ? t('正在读取…') : t('尚未读取');

      const baseline = loaded?.state?.baseline;
      baselineDd.textContent = baseline
        ? isStub(baseline.content)
          ? t('空 stub（默认）')
          : t('非空快照 · {count} 字符', { count: baseline.content.length.toLocaleString(locale) })
        : t('尚未建立基线');
      baselineDd.title = loaded?.state?.baselineLabel ?? '';

      message.hidden = !state.message;
      message.textContent = state.message;
      message.dataset.tone = state.tone;

      if (state.tab !== lastTab || state.backups.length !== lastBackupCount) {
        tabs.update({
          activeId: state.tab,
          items: [
            { id: 'override', label: t('覆盖') },
            { id: 'backups', label: t('备份'), count: state.backups.length || undefined },
          ],
        });
        lastTab = state.tab;
        lastBackupCount = state.backups.length;
      }

      const inReview = Boolean(state.review);
      tabsSlot.hidden = inReview;
      driftBanner.hidden = inReview || state.tab !== 'override' || status !== 'drifted';
      overview.hidden = inReview || state.tab !== 'override';
      presetSection.hidden = inReview || state.tab !== 'override';
      custom.hidden = inReview || state.tab !== 'override';
      review.hidden = !inReview;
      backups.hidden = inReview || state.tab !== 'backups';
      footer.hidden = inReview || state.tab !== 'override';

      const activePreset = state.presets.find((item) => item.id === state.selectedPresetId) ?? null;
      const appliedBody = loaded?.state?.applied.exists && !isStub(loaded.state.applied.content)
        ? extractBody(loaded.state.applied.content)
        : '';
      const matchedAppliedPreset = appliedBody
        ? state.presets.find((item) => item.content.trim() === appliedBody)
        : null;

      presetSelect.update({
        value: activePreset ? activePreset.id : '__draft__',
        disabled: blocked,
        options: [
          { id: '__draft__', label: t('自由草稿（未关联预设）') },
          ...state.presets.map((item) => ({
            id: item.id,
            label: item.name,
            hint: `~${estimateTokens(item.content).toLocaleString(locale)} tok`,
          })),
        ],
      });

      presetErrorNote.hidden = !state.presetError;
      presetErrorNote.textContent = state.presetError;

      saveBar.hidden = state.savingPresetMode === 'closed';
      if (state.savingPresetMode !== 'closed') {
        presetNameField.update({ value: state.presetNameDraft, disabled: state.busy });
        if (lastSavingMode === 'closed') {
          queueMicrotask(() => {
            presetNameInput?.focus();
            presetNameInput?.select();
          });
        }
      }
      lastSavingMode = state.savingPresetMode;

      const deletingPreset = state.pendingDeletePresetId
        ? state.presets.find((item) => item.id === state.pendingDeletePresetId) ?? null
        : null;
      deleteConfirmBar.hidden = !deletingPreset;
      if (deletingPreset) {
        deleteConfirmText.textContent = t('确定删除预设“{name}”？build.md 不会受影响。', { name: deletingPreset.name });
      }

      guardBar.hidden = !state.guard;

      for (const handle of buttons.values()) handle.update({ disabled: blocked });
      buttons.get('refresh')!.update({ disabled: state.busy, loading: state.busy && !loaded });
      buttons.get('copyTargetPath')!.update({ disabled: false });
      buttons.get('inspectDrift')!.update({ disabled: blocked || status !== 'drifted' });
      buttons.get('loadDiskBody')!.update({ disabled: blocked || !loaded?.current.exists });
      buttons.get('openSavePreset')!.update({
        label: activePreset ? t('更新预设') : t('保存预设'),
        disabled: blocked || !state.custom.trim() || Boolean(state.presetError),
      });
      buttons.get('openSaveAsPreset')!.update({
        disabled: blocked || !activePreset || !state.custom.trim() || Boolean(state.presetError),
      });
      buttons.get('copyText')!.update({ disabled: !state.custom.trim() });
      buttons.get('askDeletePreset')!.update({ disabled: blocked || !activePreset || Boolean(state.presetError) });
      buttons.get('cancelSavePreset')!.update({ disabled: state.busy });
      buttons.get('confirmSavePreset')!.update({ disabled: state.busy || !state.presetNameDraft.trim() });
      buttons.get('cancelDeletePreset')!.update({ disabled: state.busy });
      buttons.get('confirmDeletePreset')!.update({ disabled: state.busy });
      buttons.get('cancelGuard')!.update({ disabled: state.busy });
      buttons.get('confirmGuard')!.update({ disabled: state.busy });
      buttons.get('applyBundled')!.update({ disabled: blocked || !state.custom.trim() });
      buttons.get('restore')!.update({ disabled: blocked || status === 'builtin' || status === 'baseline' });

      const confirmButton = buttons.get('confirm')!;
      const confirmWrap = confirmButton as unknown as { update: ButtonHandle['update'] };
      const isInspect = state.review?.kind === 'inspect';
      (reviewActions.lastElementChild as HTMLElement | null)?.toggleAttribute('hidden', isInspect);
      confirmWrap.update({
        disabled: state.busy || isInspect || state.reviewInvalid || !state.review || (state.review.before.exists && state.review.before.content === state.review.content),
        label: state.review?.kind === 'restore' ? t('确认还原') : state.review?.kind === 'backup' ? t('确认恢复') : t('确认写入'),
      });
      buttons.get('cancel')!.update({ disabled: state.busy });

      const trimmed = state.custom.trim();
      const notAppliedYet = Boolean(trimmed) && (status !== 'applied' || trimmed !== appliedBody);
      const metrics = t('{lines} 行 · {chars} 字符 · ~{tokens} tokens', {
        lines: countLines(state.custom).toLocaleString(locale),
        chars: state.custom.length.toLocaleString(locale),
        tokens: estimateTokens(state.custom).toLocaleString(locale),
      });
      const matchHint = matchedAppliedPreset && status === 'applied' && !notAppliedYet
        ? ` · ${t('当前匹配预设：{name}', { name: matchedAppliedPreset.name })}`
        : '';
      editor.update({
        value: state.custom,
        disabled: state.busy || inReview,
        helper: `${metrics}${state.customDirty ? t(' · 未保存修改') : ''}${notAppliedYet ? t(' · 未应用到 build.md') : ''}${matchHint}`,
      });

      backupSelect.update({
        value: state.backupId,
        disabled: state.busy || inReview,
        options: state.backups.map((id) => ({
          id,
          label: new Date(Number(id.split('-')[0])).toLocaleString(locale),
          hint: id.slice(-4),
        })),
      });
      backupNote.textContent = state.backups.length
        ? t('显示最近 {count} 份备份；恢复前也会备份当前文件。', { count: state.backups.length })
        : t('暂无备份。首次应用或还原时会自动创建。');
      backupText.hidden = !state.backup;
      backupText.textContent = state.backup?.content ?? '';
      backupText.setAttribute('aria-label', state.backup?.label ?? t('备份内容'));
      buttons.get('backupRestore')!.update({ disabled: blocked || !state.backupId, loading: state.busy && inReview });

      if (state.review && state.review !== lastReview) {
        paintReview(state.review);
        lastReview = state.review;
      }
      if (!state.review) lastReview = null;
    },
  };
};
