export const TARGET_PATH = '~/.config/opencode/agents/build.md';
export const DATA_DIR = '~/.config/openchamber/prompt-override';
export const STATE_PATH = `${DATA_DIR}/state.json`;
export const PRESETS_PATH = `${DATA_DIR}/presets.json`;
export const BACKUP_DIR = `${DATA_DIR}/backups`;
export const STUB = '---\nmode: all\n---\n\n';
export const MAX_PROMPT = 100_000;
export const MAX_PRESETS = 40;
export const MAX_PRESET_NAME = 60;
export const BASELINE_LABEL = '基线快照（仅记录，不用于还原）';

export type Snapshot = { exists: boolean; content: string };
export type State = {
  version: 1;
  baseline: Snapshot;
  applied: Snapshot;
  appliedAt: number;
  baselineLabel: string;
};
export type Status = 'builtin' | 'baseline' | 'applied' | 'drifted' | 'missing';
export type Loaded = { state: State | null; stateRaw: string | null; current: Snapshot; status: Status };
export type Backup = { version: 1; id: string; createdAt: number; label: string; content: string };
export type PromptPreset = {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};
export type PresetLibrary = {
  version: 1;
  presets: PromptPreset[];
};
export type Review = {
  kind: 'apply' | 'restore' | 'backup' | 'inspect';
  before: Snapshot;
  content: string;
  label: string;
  backupId?: string;
};
export type Files = {
  read(path: string): Promise<string | null>;
  write(path: string, content: string): Promise<void>;
  list(path: string): Promise<string[]>;
};
export class ConflictError extends Error {}

export const sameSnapshot = (a: Snapshot, b: Snapshot): boolean => a.exists === b.exists && a.content === b.content;
export const isStub = (content: string): boolean => content.trim() === '' || content.trim() === '---\nmode: all\n---';
export const composePrompt = (body: string): string => `---\nmode: all\n---\n\n${body.trim()}\n`;

export const extractBody = (content: string): string => {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  return (match ? content.slice(match[0].length) : content).trim();
};

export const countLines = (text: string): number => (
  text.length === 0 ? 0 : text.split(/\r?\n/).length
);

export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  let cjk = 0;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (
      (code >= 0x4e00 && code <= 0x9fff)
      || (code >= 0x3400 && code <= 0x4dbf)
      || (code >= 0x3000 && code <= 0x30ff)
      || (code >= 0xac00 && code <= 0xd7af)
      || (code >= 0xff00 && code <= 0xffef)
    ) {
      cjk += 1;
    }
  }
  const rest = Math.max(0, text.length - cjk);
  return Math.max(1, Math.round(cjk * 1.45 + rest / 4));
};
