export const TARGET_PATH = '~/.config/opencode/agents/build.md';
export const DATA_DIR = '~/.config/openchamber/prompt-override';
export const STATE_PATH = `${DATA_DIR}/state.json`;
export const BACKUP_DIR = `${DATA_DIR}/backups`;
export const STUB = '---\nmode: all\n---\n\n';
export const MAX_PROMPT = 100_000;
export const BASELINE_LABEL = '内置提示词基线 · 2026-10-21';

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
export type Review = { kind: 'apply' | 'restore' | 'backup'; before: Snapshot; content: string; label: string; backupId?: string };
export type Files = {
  read(path: string): Promise<string | null>;
  write(path: string, content: string): Promise<void>;
  list(path: string): Promise<string[]>;
};
export class ConflictError extends Error {}

export const sameSnapshot = (a: Snapshot, b: Snapshot): boolean => a.exists === b.exists && a.content === b.content;
export const isStub = (content: string): boolean => content.trim() === '' || content.trim() === '---\nmode: all\n---';
export const composePrompt = (body: string): string => `---\nmode: all\n---\n\n${body.trim()}\n`;
