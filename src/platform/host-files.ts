import type { HostClient } from '@openchamber/sdk';
import { BACKUP_DIR, STATE_PATH, TARGET_PATH, type Files } from '../core/types.ts';

const errorCode = (error: unknown): unknown => error && typeof error === 'object' && 'code' in error ? error.code : undefined;
type Operation = 'read' | 'write' | 'list';

const targetLabel = (path: string, operation: Operation): string => {
  if (path === TARGET_PATH) return 'build 提示词';
  if (path === STATE_PATH) return '覆盖状态';
  if (path === `${BACKUP_DIR}` && operation === 'list') return '备份列表';
  if (path.startsWith(`${BACKUP_DIR}/`)) return '备份文件';
  return operation === 'list' ? '文件列表' : '文件';
};

const hostErrorMessage = (error: unknown, nonLatinDirectory = false): string => {
  const code = errorCode(error);
  if (code === 'NOT_GRANTED') return '请在设置 → 扩展中允许“内置提示词”访问 build.md 与覆盖数据目录。';
  if (code === 'DENIED') return '文件权限不足，请检查 build.md 或覆盖数据目录的权限。';
  if (code === 'HOST_TIMEOUT') return '宿主响应超时，请重新读取文件确认实际状态，再继续操作。';
  if (code === 'BAD_PATH') return '目标路径不在授权范围内，或符号链接指向了其他目录。';
  if (code === 'HOST_REJECTED') {
    const message = error instanceof Error ? error.message : '';
    if (nonLatinDirectory && message === 'Extension operation failed.') {
      return '当前工作目录含中文等字符，触发了 OpenChamber 文件接口的兼容问题。可暂时在无项目会话中从右侧打开“内置提示词”。';
    }
    if (!message || message === 'Extension operation failed.' || message === 'File operation failed.') {
      return 'OpenChamber 文件接口返回异常，未提供具体原因。请重新读取；持续失败时重新加载面板。';
    }
  }
  return error instanceof Error ? error.message : '操作未完成，请重试。';
};

export class FileOperationError extends Error {
  readonly code: unknown;
  constructor(operation: Operation, path: string, cause: unknown, nonLatinDirectory: boolean) {
    const action = operation === 'write' ? '写入' : '读取';
    super(`${action} ${targetLabel(path, operation)}失败：${hostErrorMessage(cause, nonLatinDirectory)}${operation === 'write' ? ' 写入结果尚未确认，请先重新读取实际状态，勿直接重复写入。' : ''}`, { cause });
    this.name = 'FileOperationError';
    this.code = errorCode(cause);
  }
}

export const hostFiles = (host: HostClient): Files => {
  let nonLatinDirectory = false;
  const updateDirectory = (directory: string | null) => { nonLatinDirectory = /[^\u0000-\u00ff]/.test(directory ?? ''); };
  host.onReady(context => updateDirectory(context.directory));
  host.onDirectory(updateDirectory);
  return {
    async read(path) {
      const directoryAtRequest = nonLatinDirectory;
      try { return (await host.readFile(path)).content; }
      catch (error) {
        if (errorCode(error) === 'NOT_FOUND') return null;
        throw new FileOperationError('read', path, error, directoryAtRequest);
      }
    },
    async write(path, content) {
      const directoryAtRequest = nonLatinDirectory;
      try { await host.writeFile(path, content); }
      catch (error) { throw new FileOperationError('write', path, error, directoryAtRequest); }
    },
    async list(path) {
      const directoryAtRequest = nonLatinDirectory;
      try { return (await host.listDir(path)).entries.filter(entry => entry.kind === 'file').map(entry => entry.name); }
      catch (error) {
        if (errorCode(error) === 'NOT_FOUND') return [];
        throw new FileOperationError('list', path, error, directoryAtRequest);
      }
    },
  };
};

export const explainError = (error: unknown): string => error instanceof FileOperationError ? error.message : hostErrorMessage(error);
