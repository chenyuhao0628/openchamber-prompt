# openchamber-prompt

English | [简体中文](#简体中文)

## English

**Prompt Override** manages the OpenCode build agent's system prompt override in `~/.config/opencode/agents/build.md`. It previews the diff, backs up the current file, writes and reads back, and can restore the empty stub to return to the OpenCode default.

### Highlights

- Apply, preview, back up, delete old backups with confirmation, and restore the build prompt from one panel and Work Status section.
- Live character/line/estimated-token metrics, diff comparison toggle against either the live file or the recorded initial baseline, and collapsible baseline snapshot inspection/copy.
- The baseline is recorded only; restore always writes the empty stub, so the OpenCode default applies.
- Detects external edits and enters a drift state with a sidebar badge instead of overwriting.
- Ships no prompt text; the editor starts empty.
- Replaces the complete build system prompt, so tool policies and code references must be preserved.
- Only touches `~/.config/opencode/agents/build.md` and `~/.config/openchamber/prompt-override/**`.
- Panel and Work Status copy follow the host language (Simplified Chinese or English).

### Screenshot

<img src="docs/screenshots/panel.jpg" alt="Prompt Override panel" width="420">

*Synthetic preview with sample prompt text. No real prompt file is read or changed.*

### Install

In OpenChamber, open **Settings → Extensions → Add extension** and paste:

```text
https://github.com/chenyuhao0628/openchamber-prompt
```

Requires OpenChamber **2.4.0 or newer**. This extension replaces the complete build system prompt; it is not an additional rule file.

> Uninstall does not restore `build.md`; choose **Restore empty** first. The panel and Work Status copy follow the host language (Simplified Chinese or English). The full Chinese documentation is below.

---

## 简体中文

当前版本 **0.2.0**，核对日期 **2026-11-11**。管理 `~/.config/opencode/agents/build.md`：实时字数与估算 Token 指标、相对当前文件/首次基线双对照与基线快照查看复制、应用覆盖、自动备份与确认清理、还原为空及漂移侧栏徽标。面板和工作状态文案跟随宿主语言在简体中文和英文间切换。

## 基线 / 还原

- **基线**只是第一次应用前 `build.md` 的快照，仅记录，不用于还原。
- **还原**固定写回空 stub，移除覆盖，交回 OpenCode 默认。
- 本扩展不包含内置 prompt 正文。OpenCode 的默认由模型决定（DeepSeek 用 `system.txt`，Trinity 用 `trinity.txt` 等）；不要把某一份内置 prompt 当成通用基线。

## 使用

1. 打开「内置提示词」。
2. 填入覆盖内容，点“应用覆盖”，预览后确认。
3. 点“还原为空（交回默认）”写回空 stub。
4. 每次写入前自动备份；可预览恢复。

## 状态

| 状态 | 含义 |
| --- | --- |
| 未覆盖（交回 OpenCode 默认） | 当前是空 stub |
| 已应用覆盖 | 当前是上次写入的覆盖 |
| 文件已被外部修改 | 需要重新预览 |
| build.md 缺失 | 应用会创建 |

## 注意

- 覆盖会替换 build 的 system prompt，影响所有 provider。
- 还原是清空；需要保留覆盖前内容，请先备份。
- 卸载前先还原为空。

## 安装 / 开发

设置 → 扩展 → 添加扩展，选择本目录或 Git URL。

```sh
npm ci
npm run typecheck
npm test
```
